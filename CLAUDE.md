# CLAUDE.md — Dự án "Quản lý Đoàn"

> File này dành cho Claude Code. Đọc kỹ trước khi sửa code.

## 1. Mục tiêu
Web app nội bộ để **lưu trữ và tra cứu thông tin các đoàn theo thời gian**. Dùng cho
**nhiều người trên PC**, cùng xem chung một kho dữ liệu. Dữ liệu là một cây 2 nhánh:
**Đoàn vào** và **Đoàn ra**. Mỗi nhánh có bộ trường riêng theo format quy định.

Trạng thái hiện tại: **nhánh Đoàn vào đã scaffold xong** (form nhập + lưu + tra cứu +
upload file). **Nhánh Đoàn ra chưa làm** (chờ spec).

## 2. Stack
- **Vite + React 18 + TypeScript**
- **Tailwind CSS** (theme màu/định nghĩa font ở `tailwind.config.js`)
- **Supabase**: Postgres (data) + Auth (đăng nhập) + Storage (file đính kèm)
- Deploy: **Vercel/Netlify** (static) + Supabase Cloud (backend)
- Icons: `lucide-react`. Font: Be Vietnam Pro (body) + Lora (heading), nạp ở `index.html`.

## 3. Cấu trúc
```
src/
  App.tsx                       # auth gate (login) + dashboard + tabs
  lib/
    supabase.ts                 # client + uploadFile() + signedUrl()
    types.ts                    # interface DoanVao (khớp cột DB)
  features/doan-vao/
    fields.ts                   # ★ NGUỒN SỰ THẬT: định nghĩa trường Đoàn vào
    DoanVaoForm.tsx             # form render từ fields.ts
    DoanVaoList.tsx             # bảng tra cứu + search + chi tiết + tải file
supabase/schema.sql             # tạo bảng, enum, RLS, storage bucket
docs/prototype-doan-vao.html    # bản demo tĩnh — dùng làm tham chiếu UI/UX
```

## 4. Nguyên tắc quan trọng
- **`features/doan-vao/fields.ts` là nguồn sự thật.** Form, bảng tra cứu, màn chi tiết
  và ô tìm kiếm đều render từ mảng `DOAN_VAO_FIELDS`. Thêm/sửa trường thì sửa ở đây
  (kèm cột tương ứng trong `schema.sql` + `types.ts`). Đừng hardcode trường rải rác.
- File field lưu **path** trỏ tới Storage bucket `doan-files`; `hinh_anh_paths` là mảng.
- Mọi cột DB là **snake_case**; key trong form là camelCase — map qua `column` trong fields.

## 5. Setup để chạy
1. `npm install`
2. Tạo project trên https://supabase.com → vào **SQL Editor**, dán toàn bộ `supabase/schema.sql` và Run.
3. Copy `.env.example` → `.env`, điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
   (Supabase → Settings → API).
4. Tạo user đầu tiên: Supabase → Authentication → Users → Add user (email + password).
5. `npm run dev` → mở http://localhost:5173

## 6. Việc cần làm tiếp (ưu tiên từ trên xuống)
1. **Port UI/UX** từ `docs/prototype-doan-vao.html` cho đẹp hơn (badge trạng thái,
   spacing, modal) — bản React hiện mới ở mức chức năng.
2. **Sửa bản ghi** (edit): hiện mới có thêm/xoá. Thêm chế độ edit cho `DoanVaoForm`
   (giữ file cũ nếu không chọn file mới — xem cách prototype xử lý `editingFiles`).
3. **Nhánh Đoàn ra**: chờ spec từ chủ dự án. Khi có:
   - tạo bảng `public.doan_ra` trong `schema.sql`
   - tạo `features/doan-ra/fields.ts` + form + list (clone pattern Đoàn vào)
   - thêm chuyển nhánh ở `Dashboard` (Đoàn vào / Đoàn ra).
4. **Danh sách đơn vị thật**: thay `DON_VI_OPTIONS` trong `fields.ts`, hoặc đọc động từ
   bảng `don_vi` (đã có sẵn) để admin tự quản lý.
5. **Phân quyền (cần xác nhận với chủ dự án)**: hiện mọi user đăng nhập có toàn quyền.
   Nếu cần admin-sửa / người-khác-chỉ-xem → thêm cột `role` hoặc bảng `profiles` và
   siết policy trong `schema.sql`.
6. **Deploy**: đẩy lên GitHub → import vào Vercel → set 2 biến môi trường VITE_* →
   thêm domain Vercel vào Supabase Auth (Authentication → URL Configuration).

## 7. Quyết định còn mở (hỏi chủ dự án trước khi code)
- Mô hình đăng nhập/phân quyền cuối cùng (mục 6.5).
- Có cần cho người dùng tự đăng ký không, hay admin tạo tài khoản thủ công.
- Giới hạn dung lượng / loại file đính kèm.
