import { invokeLLM } from "./_core/llm";
import { incrementBuzzword, saveAnalysis } from "./db";

interface AnalysisResult {
  score: number;
  buzzwords: string[];
  suggestions: string[];
  explanation: string;
}

const NORWEGIAN_BUZZWORDS = [
  "synergi", "paradigme", "holistisk", "disruptiv", "innovativ", "proaktiv", 
  "strategisk", "verdiøkende", "bærekraftig", "transformativ", "skalerbar",
  "kryssfunksjonell", "best practice", "low-hanging fruit", "win-win",
  "game changer", "deep dive", "circle back", "touch base", "leverage",
  "bandwidth", "stakeholder", "value-add", "agile", "robust", "optimalisere",
  "effektivisere", "strømlinjeforme", "digitalisering", "automatisering"
];

const ENGLISH_BUZZWORDS = [
  "synergy", "paradigm", "holistic", "disruptive", "innovative", "proactive",
  "strategic", "value-added", "sustainable", "transformative", "scalable",
  "cross-functional", "best practice", "low-hanging fruit", "win-win",
  "game changer", "deep dive", "circle back", "touch base", "leverage",
  "bandwidth", "stakeholder", "value-add", "agile", "robust", "optimize",
  "streamline", "digitalization", "automation", "ecosystem", "empower"
];

function detectBuzzwords(text: string, language: string): string[] {
  const buzzwordList = language === 'no' ? NORWEGIAN_BUZZWORDS : ENGLISH_BUZZWORDS;
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const word of buzzwordList) {
    // Match whole words only
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'gi');
    if (regex.test(lowerText)) {
      found.push(word);
    }
  }
  
  return found;
}

async function analyzeWithLLM(text: string, language: string): Promise<AnalysisResult> {
  const systemPrompt = language === 'no' 
    ? `Du er en ekspert på å identifisere "bullshit" i tekster - altså tomme fraser, buzzwords, og innholdsløs sjargong som ikke tilfører reell verdi. Din oppgave er å analysere tekster og gi en score fra 0-100 hvor:
- 0-20: Klar, konkret og meningsfull tekst
- 21-40: Noe bruk av buzzwords, men fortsatt forståelig
- 41-60: Betydelig bruk av sjargong og vage formuleringer
- 61-80: Mye innholdsløs tekst og buzzwords
- 81-100: Ekstremt høyt nivå av meningsløst innhold

Identifiser også spesifikke buzzwords og gi konkrete forbedringsforslag.`
    : `You are an expert at identifying "bullshit" in texts - empty phrases, buzzwords, and meaningless jargon that adds no real value. Your task is to analyze texts and give a score from 0-100 where:
- 0-20: Clear, concrete and meaningful text
- 21-40: Some use of buzzwords, but still understandable
- 41-60: Significant use of jargon and vague formulations
- 61-80: Lots of empty text and buzzwords
- 81-100: Extremely high level of meaningless content

Also identify specific buzzwords and give concrete improvement suggestions.`;

  const userPrompt = language === 'no'
    ? `Analyser følgende tekst og gi en bullshit-score (0-100), identifiser buzzwords, og gi forbedringsforslag:\n\n${text}`
    : `Analyze the following text and give a bullshit score (0-100), identify buzzwords, and give improvement suggestions:\n\n${text}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "bullshit_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { 
              type: "integer", 
              description: "Bullshit score from 0 to 100" 
            },
            buzzwords: { 
              type: "array", 
              items: { type: "string" },
              description: "List of detected buzzwords and empty phrases"
            },
            suggestions: { 
              type: "array", 
              items: { type: "string" },
              description: "Concrete suggestions for improving the text"
            },
            explanation: {
              type: "string",
              description: "Brief explanation of the score"
            }
          },
          required: ["score", "buzzwords", "suggestions", "explanation"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (!content || typeof content !== 'string') {
    throw new Error("No valid response from LLM");
  }

  return JSON.parse(content) as AnalysisResult;
}

export async function analyzeText(text: string, language: string) {
  // Detect buzzwords using pattern matching
  const detectedBuzzwords = detectBuzzwords(text, language);
  
  // Get AI analysis
  const llmResult = await analyzeWithLLM(text, language);
  
  // Combine results - merge buzzwords from both sources
  const allBuzzwords = Array.from(new Set([...detectedBuzzwords, ...llmResult.buzzwords]));
  
  // Save to database
  await saveAnalysis({
    text,
    language,
    score: llmResult.score,
    suggestions: JSON.stringify(llmResult.suggestions),
    buzzwords: JSON.stringify(allBuzzwords),
  });
  
  // Update buzzword counts
  for (const word of allBuzzwords) {
    await incrementBuzzword(word.toLowerCase(), language);
  }
  
  return {
    score: llmResult.score,
    buzzwords: allBuzzwords,
    suggestions: llmResult.suggestions,
    explanation: llmResult.explanation,
  };
}
