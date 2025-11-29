import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  analysis: router({
    analyze: publicProcedure
      .input(z.object({
        text: z.string().min(10).max(50000),
        language: z.enum(['no', 'en']),
      }))
      .mutation(async ({ input }) => {
        const { analyzeText } = await import('./analysis');
        return await analyzeText(input.text, input.language);
      }),
    
    analyzeDocument: publicProcedure
      .input(z.object({
        fileUrl: z.string().url(),
        mimeType: z.string(),
        language: z.enum(['no', 'en']),
      }))
      .mutation(async ({ input }) => {
        const { extractTextFromFile } = await import('./documentExtractor');
        const { analyzeText } = await import('./analysis');
        
        // Download file
        const response = await fetch(input.fileUrl);
        if (!response.ok) {
          throw new Error('Failed to download file');
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Extract text
        const text = await extractTextFromFile(buffer, input.mimeType);
        
        if (text.length < 10) {
          throw new Error('Extracted text is too short');
        }
        
        // Analyze
        return await analyzeText(text, input.language);
      }),
    
    analyzeUrl: publicProcedure
      .input(z.object({
        url: z.string().url(),
        language: z.enum(['no', 'en']),
      }))
      .mutation(async ({ input }) => {
        const { extractTextFromUrl } = await import('./urlScraper');
        const { analyzeText } = await import('./analysis');
        
        // Extract text from URL
        const text = await extractTextFromUrl(input.url);
        
        // Analyze
        return await analyzeText(text, input.language);
      }),
    
    topBuzzwords: publicProcedure
      .input(z.object({
        language: z.enum(['no', 'en', 'all']).optional().default('all'),
        limit: z.number().min(1).max(100).optional().default(20),
      }))
      .query(async ({ input }) => {
        const { getTopBuzzwords, getAllTopBuzzwords } = await import('./db');
        if (input.language === 'all') {
          return await getAllTopBuzzwords(input.limit);
        }
        return await getTopBuzzwords(input.language, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
