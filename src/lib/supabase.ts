import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn("Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — xem .env.example");
}

export const supabase = createClient(url ?? "", key ?? "");

export const FILES_BUCKET = "doan-files";

// Upload 1 file lên Storage, trả về path. (Dùng cho các field type "file".)
export async function uploadFile(file: File, folder = "doan-vao"): Promise<string> {
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from(FILES_BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

// Lấy URL ký tạm để xem/tải file.
export async function signedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(FILES_BUCKET).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
