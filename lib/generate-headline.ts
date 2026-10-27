const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You write one-line news headlines for "The Dog Daily", a BBC-style homepage of real stories.

Given a real news headline, rewrite it as ONE short, intriguing headline that still reports the actual news.

Rules:
- Output only the headline itself. No quotes, no explanation, no trailing period.
- Keep it between 40 and 80 characters.
- Use the actual news: names, facts, and the hook of the story. Do not invent details.
- Add a little creative flourish so it isn't a dry wire rewrite — punchy, specific, intriguing.
- Never use "Dogs would never...", "Dogs never...", "Dogs don't...", or any punchline about dogs.
- Don't moralise. Don't add "unlike dogs".`;

const FEW_SHOT_EXAMPLES: Array<{ real: string; rewritten: string }> = [
  {
    real: "Rivals Altman and Musk rally behind Amodei's call for an AI slowdown",
    rewritten: "Altman and Musk back a slowdown. They still hold the keys.",
  },
  {
    real: "Man accused of mid-air racist outburst loses job over duct-tape flight incident",
    rewritten: "Racist outburst mid-flight. Then they duct-taped him down.",
  },
  {
    real: "Sydney Sweeney under fire for ‘sexualising women’s sport’ in sports prediction ad",
    rewritten: "Sydney Sweeney accused of sexualising women's sport",
  },
  {
    real: "Prince Harry, Meghan Markle to remain 'non-working royals' in UK, King Charles III confirms",
    rewritten: "King Charles: Harry and Meghan stay non-working royals",
  },
  {
    real: "Trump the renamer-in-chief keen to leave his mark – or his stain – on world",
    rewritten: "Trump wants to rename the neighbour's lake",
  },
];

/**
 * Asks an LLM to tighten a real news headline into a short, intriguing
 * homepage line (see SYSTEM_PROMPT / FEW_SHOT_EXAMPLES above).
 * Requires OPENAI_API_KEY; throws if it's missing or the request fails so callers can
 * fall back to the real headline instead of silently returning garbage.
 */
export async function generateJokeHeadline(realHeadline: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: OPENAI_API_KEY. Copy .env.local.example to .env.local and fill it in."
    );
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...FEW_SHOT_EXAMPLES.flatMap((example) => [
      { role: "user" as const, content: example.real },
      { role: "assistant" as const, content: example.rewritten },
    ]),
    { role: "user" as const, content: realHeadline },
  ];

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 60,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Headline generation failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const body = await response.json();
  const line: string | undefined = body?.choices?.[0]?.message?.content;
  const cleaned = line?.trim().replace(/^["']|["']$/g, "");

  if (!cleaned) {
    throw new Error("Headline generation returned an empty response.");
  }

  return cleaned;
}
