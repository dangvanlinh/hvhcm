// Bản ghi khớp cột bảng tương ứng trong Supabase.
// File field lưu PATH (string) trong Storage; *_paths là mảng path.

export interface DoanVao {
  id: string;
  thoi_gian: string | null;
  danh_nghia: string;
  quoc_gia_den: string | null;
  cap: "A" | "B" | "C" | null;
  td_ho_ten: string | null;
  td_co_quan: string | null;
  td_ly_lich_path: string | null;
  so_nguoi: number | null;
  ds_thanh_vien_path: string | null;
  don_vi_chuan_bi: string | null;
  chu_tri_tiep: string | null;
  chu_tri_chuc_danh: string | null;
  noi_dung: string | null;
  chuong_trinh_path: string | null;
  hinh_anh_paths: string[] | null;
  ho_so_path: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DoanRa {
  id: string;
  thoi_gian_tu: string | null;
  thoi_gian_den: string | null;
  danh_nghia: string;
  quoc_gia_den_cong_tac: string[] | null;
  cap: "Cấp Thứ trưởng" | "Cấp Vụ - Viện" | null;
  td_ho_ten: string | null;
  td_co_quan: string | null;
  td_ly_lich_path: string | null;
  so_nguoi: number | null;
  ds_thanh_vien_path: string | null;
  don_vi_chu_tri: string | null;
  nguon_kinh_phi: string[] | null;
  nguon_kinh_phi_khac: string | null;
  noi_dung_lam_viec: string | null;
  doi_tac: string[] | null;
  thong_tin_doi_tac_path: string | null;
  chuong_trinh_path: string | null;
  hinh_anh_paths: string[] | null;
  ho_so_paths: string[] | null;
  created_by: string | null;
  created_at: string;
}
