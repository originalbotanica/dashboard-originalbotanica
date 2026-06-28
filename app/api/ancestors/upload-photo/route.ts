import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * POST /api/ancestors/upload-photo
 *
 * Receives a single image file as multipart/form-data (field name "file").
 * Uploads it to the ancestor-photos Supabase Storage bucket under a path
 * scoped to the member's user id, and returns the public URL.
 *
 * Used by the memorial form to attach a portrait of the loved one.
 * Photos are public-readable (the URL appears on shareable /candle pages).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const blob = form.get("file");
    if (blob instanceof File) file = blob;
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Photo must be 5 MB or smaller" },
      { status: 413 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Photo must be a JPG, PNG, WebP, or HEIC" },
      { status: 415 },
    );
  }

  const admin = createAdminClient();
  // Derive the extension from the validated MIME type, never the user-supplied
  // filename (which could carry path separators or odd characters).
  const EXT_BY_TYPE: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadErr } = await admin.storage
    .from("ancestor-photos")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
  if (uploadErr) {
    console.error("Photo upload error:", uploadErr);
    return NextResponse.json(
      { error: "Could not save the photo. Please try again." },
      { status: 500 },
    );
  }

  const { data: pub } = admin.storage
    .from("ancestor-photos")
    .getPublicUrl(path);

  return NextResponse.json({ url: pub.publicUrl });
}
