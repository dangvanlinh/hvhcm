# Quản lý Đoàn

Web app nội bộ lưu trữ & tra cứu thông tin các đoàn (Đoàn vào / Đoàn ra) cho nhiều người dùng.

## Chạy nhanh
```bash
npm install
cp .env.example .env      # rồi điền VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

## Backend (Supabase)
1. Tạo project tại https://supabase.com
2. SQL Editor → dán `supabase/schema.sql` → Run
3. Settings → API: lấy URL + anon key điền vào `.env`
4. Authentication → Users → thêm tài khoản đầu tiên

## Tài liệu
- `CLAUDE.md` — brief đầy đủ + danh sách việc cần làm tiếp (mở bằng Claude Code).
- `docs/prototype-doan-vao.html` — bản demo tĩnh, dùng tham chiếu UI/UX.

## Stack
Vite + React + TypeScript + Tailwind + Supabase (DB/Auth/Storage). Deploy Vercel.
