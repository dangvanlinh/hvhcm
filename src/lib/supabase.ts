import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn("Thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — xem .env.example");
}

export const supabase = createClient(url ?? "", key ?? "");

export const FILES_BUCKET = "doan-files";

// Sanitize tên file: bỏ dấu tiếng Việt + ký tự đặc biệt để khớp với
// Supabase Storage key (chỉ cho a-z, 0-9, -, _, ., /).
function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")                          // tách ký tự + dấu
    .replace(/[̀-ͯ]/g, "")           // bỏ dấu thanh/dấu nguyên âm
    .replace(/đ/g, "d").replace(/Đ/g, "D")     // đ -> d (NFD không tách)
    .replace(/[^a-zA-Z0-9._-]+/g, "_")         // còn lại quy về _
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// Upload 1 file lên Storage, trả về path. (Dùng cho các field type "file".)
export async function uploadFile(file: File, folder = "doan-vao"): Promise<string> {
  const safe = sanitizeFileName(file.name) || "file";
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
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
