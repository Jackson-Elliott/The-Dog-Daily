import type { Episode } from "@/types/episode";
import type { GeneratedImageStyle } from "@/lib/imagery";

export interface ImagePromptConfig {
  prompt: string;
  /**
   * When true, the story's original news photo is sent to OpenAI as a
   * reference image (edits endpoint) instead of generating from text alone.
   */
  useReferencePhoto: boolean;
  /** When true, the local style-reference image for this genre is sent to OpenAI. */
  useStyleReference: boolean;
}

function storyContext(episode: Episode): string {
  return [
    `Headline: ${episode.headline ?? episode.scriptName}`,
    episode.summary ? `Summary: ${episode.summary}` : null,
    episode.category ? `Section: ${[episode.category, episode.subcategory].filter(Boolean).join(" / ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const COLLAGE_RULES = `Create a striking vintage political editorial collage with the aesthetic of an old printed magazine cover or mid-century propaganda poster.

IMAGE TREATMENT: Use high-contrast black-and-white photographic imagery, with a gritty, halftone newspaper-print effect. Images should feel like archival press photographs that have been cut out and assembled by hand. Preserve realistic photographic detail while introducing rough ink textures, visible print dots, grain, distressed surfaces and slightly imperfect reproduction.

COLLAGE & COMPOSITION: Build the composition from overlapping photographic cutouts, torn paper edges, cropped images and layered graphic elements. Combine large central imagery with smaller supporting visual fragments. Allow elements to overlap, obscure one another and extend beyond the visual boundaries of other elements. The arrangement should feel deliberately art-directed but retain the raw, tactile quality of a handmade editorial collage. Wide landscape composition (16:9).

PRINT & TEXTURE: Apply a consistent vintage screen-print and newsprint aesthetic across the entire image. Include visible paper fibres, fine grain, distressed ink, subtle misregistration, uneven ink coverage and worn printing imperfections. Use a warm, off-white paper background with a subtle recycled-paper texture.

ART DIRECTION: Bold, confrontational, intelligent and visually punchy. The aesthetic should evoke political magazine covers, archival newspaper photography, vintage propaganda graphics and contemporary independent editorial design. High contrast, strong silhouettes, layered depth and an intentionally imperfect analogue finish.

IMPORTANT: The result must feel like a physical printed artwork assembled from photographs, ink and paper, rather than a clean digital illustration. Avoid glossy digital rendering, smooth gradients, polished vector graphics, photorealistic 3D elements and overly clean edges. No readable text, no logos, no captions.

Remove or don't add any recognisable logos.

INPUT IMAGES:
Image 1 is the news photograph for this story. Use it as the subject and content source: recast that story and those people, places, and objects as the collage. Do not invent a different event.
Image 2 is a style reference only. Match its collage technique, torn-paper layering, halftone newsprint, colour-block graphics, off-white paper, and analogue print finish. Do not copy any people, buildings, flags, aircraft, or other subjects from Image 2. Image 2 has no lettering — keep the result equally text-free: no headlines, captions, mastheads, or typography of any kind.

COLOUR PALETTE: Off-white background. Bold colours that match the vibe of the story — take colour-block energy from Image 2, not its specific red/blue/white scheme unless the story calls for it.`;

const ILLUSTRATION_RULES = `Create a hand-drawn watercolour political cartoon for this news story.

STYLE: Ink-pen line drawing with watercolour washes on white watercolour paper. It should feel handmade and slightly simplistic, with a clear, consistent cartoon aesthetic — not photorealistic, not digital-slick, not 3D. Visible ink lines, loose washes, paper texture, and a little unevenness in the drawing.

COMPOSITION: Wide landscape (16:9). A single clear satirical scene that comments on the story. Keep the drawing readable at thumbnail size: strong silhouettes, simple shapes, not too many tiny details.

WHAT THE IMAGE IS OF: Illustrate this news story as a political cartoon. Invent the scene from the headline and summary — do not copy a photograph.

INPUT IMAGES:
Image 1 is a style reference only. Match its ink-and-watercolour technique, paper, line weight, colouring, and handmade cartoon look. Do not copy its subjects (dogs, dog park, data centres, or any other people, places, or objects from Image 1) unless this story is actually about those things.

AVOID: Any logos, brand marks, trademarks, or lettering that could be deemed copyright. No company logos, no sports crests, no product packaging, no recognizable brand names. Original hand-lettered signs are fine only if they are generic and not a real brand.`;

const STYLE_RULES: Record<
  GeneratedImageStyle,
  { rules: string; useReferencePhoto: boolean; useStyleReference: boolean }
> = {
  illustration: {
    rules: ILLUSTRATION_RULES,
    useReferencePhoto: false,
    useStyleReference: true,
  },
  collage: {
    rules: COLLAGE_RULES,
    useReferencePhoto: true,
    useStyleReference: true,
  },
};

export function buildImagePrompt(episode: Episode, style: GeneratedImageStyle): ImagePromptConfig {
  const { rules, useReferencePhoto, useStyleReference } = STYLE_RULES[style];
  return { prompt: `${rules}\n\n${storyContext(episode)}`, useReferencePhoto, useStyleReference };
}
