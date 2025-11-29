import * as cheerio from "cheerio";

export async function extractTextFromUrl(url: string): Promise<string> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new Error("Only HTTP and HTTPS URLs are supported");
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BullshitDetector/1.0; +https://bsdetect.org)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML and extract text
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, header, footer, aside, iframe, noscript").remove();

    // Extract text from main content areas
    let text = "";

    // Try to find main content
    const mainSelectors = [
      "main",
      "article",
      '[role="main"]',
      ".content",
      ".main-content",
      "#content",
      "#main",
    ];

    for (const selector of mainSelectors) {
      const mainContent = $(selector);
      if (mainContent.length > 0) {
        text = mainContent.text();
        break;
      }
    }

    // If no main content found, get body text
    if (!text) {
      text = $("body").text();
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
      .trim();

    if (text.length < 50) {
      throw new Error("Extracted text is too short. The URL might not contain readable content.");
    }

    // Limit text length to avoid overwhelming the LLM
    if (text.length > 50000) {
      text = text.substring(0, 50000);
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from URL: ${error.message}`);
    }
    throw new Error("Failed to extract text from URL");
  }
}
