import { NextResponse } from "next/server";
import { createEpisode } from "@/lib/episodes";
import { CATEGORIES } from "@/lib/categories";

/** Admin-only (guarded by proxy.ts): create a new episode. */
export async function POST(request: Request) {
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
  if (!(audioFile instanceof File) || audioFile.size === 0) {
    return NextResponse.json({ error: "An audio file is required." }, { status: 400 });
  }

  try {
    const episode = await createEpisode({
      scriptName: scriptName.trim(),
      airDate: airDate.trim(),
      sourceUrl: typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : null,
      headline: typeof headline === "string" && headline.trim() ? headline.trim() : null,
      category:
        typeof category === "string" && (CATEGORIES as readonly string[]).includes(category)
          ? category
          : null,
      photoImageUrl:
        typeof photoImageUrl === "string" && photoImageUrl.trim() ? photoImageUrl.trim() : null,
      photoFile: photoFile instanceof File && photoFile.size > 0 ? photoFile : null,
      audioFile,
      published: formData.get("published") !== "false",
    });
    return NextResponse.json({ episode }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create episode." },
      { status: 500 }
    );
  }
}
