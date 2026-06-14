// ─────────────────────────────────────────────────────────────────────────
// NGUỒN SỰ THẬT cho nhánh "Đoàn vào".
// Sửa config này là form, bảng tra cứu và màn chi tiết tự cập nhật theo.
// `column` = tên cột trong bảng `doan_vao` (Supabase).
// File field lưu PATH trỏ tới Supabase Storage (bucket "doan-files").
// ─────────────────────────────────────────────────────────────────────────

import type { EntityConfig } from "../shared/fieldTypes";
import { QUOC_GIA_OPTIONS } from "../shared/countries";
import { DON_VI_HV_OPTIONS } from "../shared/donVi";

const CAP_OPTIONS = ["A", "B", "C"] as const;
const NOI_DUNG_OPTIONS = [
  "Tiếp xã giao",
  "Làm việc",
  "Toạ đàm/Hội nghị, hội thảo",
] as const;

export const DOAN_VAO_CONFIG: EntityConfig = {
  table: "doan_vao",
  branch: "vao",
  label: "đoàn vào",
  labelTitle: "Đoàn vào",
  fileFolder: "doan-vao",
  searchPlaceholder: "Tìm theo danh nghĩa, trưởng đoàn, đơn vị, người chủ trì…",
  sectionTitles: {
    1: "Thời gian",
    2: "Danh nghĩa đoàn",
    3: "Trưởng đoàn",
    4: "Thành phần đoàn",
    5: "Đơn vị chuẩn bị & tiếp đón",
    6: "Chương trình làm việc",
    7: "Hình ảnh",
    8: "Hồ sơ",
  },
  filters: [
    { key: "cap", column: "cap", emptyLabel: "Mọi cấp", options: CAP_OPTIONS },
    { key: "noiDung", column: "noi_dung", emptyLabel: "Mọi nội dung", options: NOI_DUNG_OPTIONS },
  ],
  fields: [
    { key: "thoiGian", column: ["thoi_gian_tu", "thoi_gian_den"] as [string, string], label: "Thời gian (Từ → Đến)", type: "date-range", section: 1, required: true, inTable: true },

    { key: "danhNghia", column: "danh_nghia", label: "Danh nghĩa đoàn", type: "text", section: 2, required: true, inTable: true, searchable: true, placeholder: "Tên / danh nghĩa của đoàn" },
    { key: "quocGiaDen", column: "quoc_gia_den", label: "Quốc gia", type: "search", section: 2, options: QUOC_GIA_OPTIONS, inTable: true, searchable: true, placeholder: "Gõ để tìm & chọn quốc gia" },
    { key: "cap", column: "cap", label: "Cấp", type: "select", section: 2, options: CAP_OPTIONS, inTable: true, searchable: true, badge: "accent" },

    { key: "tdHoTen", column: "td_ho_ten", label: "Họ & tên", type: "text", section: 3, group: "Trưởng đoàn", inTable: true, searchable: true },
    { key: "tdCoQuan", column: "td_co_quan", label: "Cơ quan / Tổ chức", type: "text", section: 3, group: "Trưởng đoàn", searchable: true },
    { key: "tdLyLich", column: "td_ly_lich_path", label: "Lý lịch", type: "file", section: 3, group: "Trưởng đoàn" },

    { key: "soNguoi", column: "so_nguoi", label: "Số người", type: "number", section: 4, group: "Thành phần đoàn", inTable: true },
    { key: "dsThanhVien", column: "ds_thanh_vien_path", label: "DS thành viên đoàn", type: "file", section: 4, group: "Thành phần đoàn" },

    { key: "donViChuanBi", column: "don_vi_chuan_bi", label: "Đơn vị chuẩn bị", type: "search", section: 5, options: DON_VI_HV_OPTIONS, inTable: true, searchable: true, placeholder: "Gõ để tìm & chọn đơn vị" },
    { key: "chuTriTiep", column: "chu_tri_tiep", label: "Chủ trì tiếp (tên)", type: "text", section: 5, searchable: true },
    { key: "chuTriChucDanh", column: "chu_tri_chuc_danh", label: "Chức danh", type: "text", section: 5, searchable: true, placeholder: "Chức danh người chủ trì" },
    { key: "noiDung", column: "noi_dung", label: "Nội dung", type: "select", section: 5, options: NOI_DUNG_OPTIONS, inTable: true, searchable: true, badge: "amber" },

    { key: "chuongTrinh", column: "chuong_trinh_path", label: "Chương trình làm việc", type: "file", section: 6 },
    { key: "hinhAnh", column: "hinh_anh_paths", label: "Hình ảnh", type: "file", section: 7, multiple: true },
    { key: "hoSo", column: "ho_so_path", label: "Hồ sơ", type: "file", section: 8 },
  ],
};
