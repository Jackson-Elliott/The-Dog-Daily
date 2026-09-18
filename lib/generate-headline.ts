const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You write one-line joke headlines for "The Dog Daily", a campaign that turns real news
headlines about bad human behaviour into short, standalone punchlines about dogs — implying dogs would
never behave this way, or don't need to. Given a real news headline, respond with ONE short line in the
voice "Dogs would never...", "Dogs never...", or "Dogs don't...".

Rules:
- Output only the headline itself. No quotes, no explanation, no trailing period.
- Keep it under 90 characters.
- It must read as a standalone joke/punchline, not a summary of the real story — do not name real people,
  companies, or specific details from the source headline.
- Keep it light and cheeky, never mean-spirited toward real victims of the news story.`;

const FEW_SHOT_EXAMPLES: Array<{ real: string; joke: string }> = [
  {
    real: "Rivals Altman and Musk rally behind Amodei's call for an AI slowdown",
    joke: "Dogs never rush to release something they can't take back",
  },
  {
    real: "Man accused of mid-air racist outburst loses job over duct-tape flight incident",
    joke: "Dogs would never get duct-taped to their seat mid-flight after a racist outburst",
  },
  {
    real: "Sydney Sweeney's nude sports ad is a slam dunk for sexism",
    joke: "Dogs never need to undress to sell something",
  },
  {
    real: "Prince Harry and Meghan Markle's UK move: King Charles clarifies their status",
    joke: "Dogs don't need their family status clarified",
  },
  {
    real: "Trump: 'Lake America,' Ontario",
    joke: "Dogs mark their territory and move on",
  },
];

/**
 * Asks an LLM to rewrite a real news headline as a short "Dogs would never..." style
 * joke punchline in the campaign's voice (see SYSTEM_PROMPT / FEW_SHOT_EXAMPLES above).
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
      { role: "assistant" as const, content: example.joke },
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
      temperature: 0.9,
      max_tokens: 60,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Headline generation failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const body = await response.json();
  const joke: string | undefined = body?.choices?.[0]?.message?.content;
  const cleaned = joke?.trim().replace(/^["']|["']$/g, "");

  if (!cleaned) {
    throw new Error("Headline generation returned an empty response.");
  }

  return cleaned;
}
