/**
 * NUR Lingo — Embedding Utilities
 * Uses text-embedding-3-small via OpenRouter/OpenAI
 */

export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("No AI API key configured for embeddings");
  }

  // If using OpenRouter, we might need to adjust the endpoint or model name
  const endpoint = "https://api.openai.com/v1/embeddings"; // Default OpenAI
  // Note: OpenRouter doesn't always support embeddings directly for all models,
  // but OpenAI's API is standard.

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  return dotProduct / (mA * mB);
}
