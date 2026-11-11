import { createClient } from "@supabase/supabase-js";
import { backend } from "@/lib/site";

export const db = createClient(backend.url, backend.key);

export const problem = (error: unknown) =>
  error && typeof error === "object" && "message" in error
    ? String((error as { message: unknown }).message)
    : "Something went wrong. Try again.";

/* Uploads a file to the public media bucket and returns its address. */
export async function upload(file: File) {
  const name = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID().slice(0, 8)}-${name || "file"}`;
  const { error } = await db.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw error;
  return db.storage.from("media").getPublicUrl(path).data.publicUrl;
}
