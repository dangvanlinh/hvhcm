-- ════════════════════════════════════════════════════════════════════════
-- QUẢN LÝ ĐOÀN — Schema Supabase
-- Chạy trong: Supabase Dashboard > SQL Editor (hoặc supabase db push)
-- An toàn để chạy lại nhiều lần (idempotent).
-- ════════════════════════════════════════════════════════════════════════

-- ── Enums ────────────────────────────────────────────────────────────────
do $$ begin
  create type cap_doan as enum ('A', 'B', 'C');
exception when duplicate_object then null; end $$;

do $$ begin
  create type noi_dung_tiep as enum ('Tiếp xã giao', 'Làm việc', 'Toạ đàm/Hội nghị, hội thảo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cap_doan_ra as enum ('Cấp Thứ trưởng', 'Cấp Vụ - Viện');
exception when duplicate_object then null; end $$;

do $$ begin
  create type noi_dung_doan_ra as enum (
    'Thăm làm việc, kết nối hợp tác',
    'Đào tạo, bồi dưỡng',
    'Nghiên cứu, khảo sát'
  );
exception when duplicate_object then null; end $$;

-- ── Bảng Đoàn vào ─────────────────────────────────────────────────────────
create table if not exists public.doan_vao (
  id                  uuid primary key default gen_random_uuid(),
  thoi_gian           date,
  danh_nghia          text not null,
  cap                 cap_doan,
  td_ho_ten           text,
  td_co_quan          text,
  td_ly_lich_path     text,
  so_nguoi            integer,
  ds_thanh_vien_path  text,
  don_vi_chuan_bi     text,
  chu_tri_tiep        text,
  noi_dung            noi_dung_tiep,
  chuong_trinh_path   text,
  hinh_anh_paths      text[],
  ho_so_path          text,
  created_by          uuid references auth.users(id) default auth.uid(),
  created_at          timestamptz not null default now()
);

create index if not exists doan_vao_created_at_idx on public.doan_vao (created_at desc);

-- ── Bảng Đoàn ra ──────────────────────────────────────────────────────────
create table if not exists public.doan_ra (
  id                       uuid primary key default gen_random_uuid(),
  -- 1. Thời gian (khoảng)
  thoi_gian_tu             date,
  thoi_gian_den            date,
  -- 2. Danh nghĩa / Cấp
  danh_nghia               text not null,
  cap                      cap_doan_ra,
  -- 3. Trưởng đoàn
  td_ho_ten                text,
  td_co_quan               text,
  td_ly_lich_path          text,
  -- 4. Thành phần đoàn
  so_nguoi                 integer,
  ds_thanh_vien_path       text,
  -- 5. Đơn vị chủ trì
  don_vi_chu_tri           text,
  -- 6. Nguồn kinh phí (multi-select + ô khác)
  nguon_kinh_phi           text[],
  nguon_kinh_phi_khac      text,
  -- 7. Nội dung & đối tác
  noi_dung_lam_viec        noi_dung_doan_ra,
  doi_tac                  text[],
  thong_tin_doi_tac_path   text,
  -- 8/9/10. Tài liệu
  chuong_trinh_path        text,
  hinh_anh_paths           text[],
  ho_so_paths              text[],
  -- meta
  created_by               uuid references auth.users(id) default auth.uid(),
  created_at               timestamptz not null default now()
);

create index if not exists doan_ra_created_at_idx on public.doan_ra (created_at desc);

-- ── (Tuỳ chọn) Danh mục đơn vị trong HV ────────────────────────────────────
create table if not exists public.don_vi (
  id    uuid primary key default gen_random_uuid(),
  ten   text not null unique
);

-- ── RLS ───────────────────────────────────────────────────────────────────
-- ⚠️  HIỆN TẠI: mở cho cả anon (chưa có login) — chỉ phù hợp DEV / nội bộ.
-- KHI bật WSO2 SSO, đổi `anon, authenticated` → chỉ `authenticated`.
alter table public.doan_vao enable row level security;
alter table public.doan_ra  enable row level security;
alter table public.don_vi   enable row level security;

drop policy if exists "doan_vao_all_authenticated" on public.doan_vao;
drop policy if exists "doan_vao_all" on public.doan_vao;
create policy "doan_vao_all" on public.doan_vao
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "doan_ra_all_authenticated" on public.doan_ra;
drop policy if exists "doan_ra_all" on public.doan_ra;
create policy "doan_ra_all" on public.doan_ra
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "don_vi_read" on public.don_vi;
create policy "don_vi_read" on public.don_vi
  for select to anon, authenticated using (true);

-- ── Storage bucket cho file đính kèm ───────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('doan-files', 'doan-files', false)
on conflict (id) do nothing;

drop policy if exists "doan_files_rw" on storage.objects;
create policy "doan_files_rw" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'doan-files') with check (bucket_id = 'doan-files');
