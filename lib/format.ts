/** Calendar date in Australia/Sydney as YYYY-MM-DD — air dates and drafts use this clock. */
export function todayInSydney(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });
}

export function formatEpisodeDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** True when the air date is after today in Sydney, so the story should stay off the public site. */
export function isScheduledDraft(airDate: string, today = todayInSydney()): boolean {
  return airDate > today;
}

export function publishedEpisodes<T extends { airDate: string }>(
  episodes: T[],
  today = todayInSydney(),
): T[] {
  return episodes.filter((episode) => !isScheduledDraft(episode.airDate, today));
}

/** Newest air date first, then newest created_at as a tie-breaker — the same order the public homepage uses. */
export function sortEpisodesByAirDate<T extends { airDate: string; createdAt: string }>(
  episodes: T[],
): T[] {
  return [...episodes].sort((a, b) => {
    const byDate = b.airDate.localeCompare(a.airDate);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Truncates a headline to roughly fit a card, matching the mock's "Headline Headline Head.." look. */
export function truncateHeadline(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

const NBSP = "\u00A0";

/** Short words that look ragged if they sit at the end of a headline line. */
const HANGING_WORDS = new Set(["to"]);

function endsWithComma(token: string): boolean {
  return /,$/.test(token);
}

function isHangingWord(token: string): boolean {
  return HANGING_WORDS.has(token.toLowerCase());
}

/**
 * Editorial wrapping for public headlines:
 * - No widows — the last two words stay on the same line.
 * - "to" wraps with the following word so it doesn't sit at the end of a
 *   line (which squares the rag on mobile).
 * - A comma with only one word after it always soft-returns that word.
 * - A comma with more words after it won't leave the first of those words
 *   dangling on the comma's line (it stays with the next word, which
 *   typically pushes the wrap to just after the comma).
 *
 * Newlines in the result are forced breaks (`<br>` in the renderer);
 * `\u00A0` is a non-breaking space.
 */
export function typesetHeadline(text: string): string {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return tokens[0] ?? "";

  const afterHanging: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (isHangingWord(tokens[i]) && i + 1 < tokens.length) {
      let glued = tokens[i];
      i += 1;
      while (i < tokens.length) {
        glued += `${NBSP}${tokens[i]}`;
        const added = tokens[i];
        i += 1;
        if (!isHangingWord(added) || i >= tokens.length) break;
      }
      afterHanging.push(glued);
      continue;
    }
    afterHanging.push(tokens[i]);
    i += 1;
  }

  const pieces: string[] = [];
  i = 0;
  while (i < afterHanging.length) {
    const token = afterHanging[i];
    const remaining = afterHanging.length - i - 1;

    if (endsWithComma(token) && remaining === 1) {
      pieces.push(`${token}\n${afterHanging[i + 1]}`);
      i += 2;
      continue;
    }

    if (endsWithComma(token) && remaining >= 2) {
      pieces.push(token, `${afterHanging[i + 1]}${NBSP}${afterHanging[i + 2]}`);
      i += 3;
      continue;
    }

    pieces.push(token);
    i += 1;
  }

  const last = pieces[pieces.length - 1];
  const prev = pieces[pieces.length - 2];
  // Don't glue across a forced comma break, and don't split on NBSP (`\s`
  // in JS matches \u00A0, which would undo the glue rules above).
  if (prev && !last.includes("\n") && !prev.includes("\n")) {
    pieces[pieces.length - 2] = `${prev}${NBSP}${last}`;
    pieces.pop();
  }

  return pieces.join(" ");
}
