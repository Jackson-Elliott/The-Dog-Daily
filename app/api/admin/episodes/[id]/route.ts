import { NextResponse } from "next/server";
import { deleteEpisode, updateEpisode } from "@/lib/episodes";
import { CATEGORIES } from "@/lib/categories";

function parseOptionalText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Admin-only (guarded by proxy.ts): update an existing episode. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();

  const scriptName = formData.get("scriptName");
  const airDate = formData.get("airDate");
  const sourceUrl = formData.get("sourceUrl");
  const headline = formData.get("headline");
  const category = formData.get("category");
  const photoImageUrl = formData.get("photoImageUrl");
  const photoFile = formData.get("photoFile");
  const audioFile = formData.get("audioFile");

  if (typeof scriptName !== "string" || !scriptName.trim()) {
    return NextResponse.json({ error: "Script name is required." }, { status: 400 });
  }
  if (typeof airDate !== "string" || !airDate.trim()) {
    return NextResponse.json({ error: "Air date is required." }, { status: 400 });
  }

  try {
    const episode = await updateEpisode(id, {
      scriptName: scriptName.trim(),
      airDate: airDate.trim(),
      sourceUrl: parseOptionalText(sourceUrl),
      headline: parseOptionalText(headline),
      category:
        typeof category === "string" && (CATEGORIES as readonly string[]).includes(category)
          ? category
          : null,
      photoImageUrl: parseOptionalText(photoImageUrl),
      photoFile: photoFile instanceof File && photoFile.size > 0 ? photoFile : null,
      audioFile: audioFile instanceof File && audioFile.size > 0 ? audioFile : null,
    });
    return NextResponse.json({ episode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update episode.";
    const status = message === "Episode not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/** Admin-only (guarded by proxy.ts): delete an episode. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteEpisode(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete episode.";
    const status = message === "Episode not found." ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
