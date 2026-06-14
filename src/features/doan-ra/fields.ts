// ─────────────────────────────────────────────────────────────────────────
// NGUỒN SỰ THẬT cho nhánh "Đoàn ra".
// Map sang bảng `doan_ra` trong Supabase.
// ─────────────────────────────────────────────────────────────────────────

import type { EntityConfig } from "../shared/fieldTypes";
import { QUOC_GIA_OPTIONS } from "../shared/countries";

const CAP_RA_OPTIONS = ["Cấp Thứ trưởng", "Cấp Vụ - Viện"] as const;

const NGUON_KP_OPTIONS = [
  "Kinh phí dành cho Hợp tác quốc tế",
  "Kinh phí dành cho nhiệm vụ khoa học",
  "Nguồn thu sự nghiệp của đơn vị",
  "Khác",
] as const;

const NOI_DUNG_RA_OPTIONS = [
  "Thăm làm việc, kết nối hợp tác",
  "Đào tạo, bồi dưỡng",
  "Nghiên cứu, khảo sát",
] as const;

// TODO: thay bằng danh sách đơn vị thật trong HV, hoặc lấy động từ bảng `don_vi`.
const DON_VI_OPTIONS = [
  "Phòng Hợp tác Quốc tế",
  "Văn phòng Học viện",
  "Phòng Đào tạo",
  "Phòng Khoa học & Công nghệ",
  "Phòng Tổ chức Cán bộ",
  "Khoa Quốc tế học",
  "Trung tâm Thông tin – Thư viện",
] as const;

export const DOAN_RA_CONFIG: EntityConfig = {
  table: "doan_ra",
  branch: "ra",
  label: "đoàn ra",
  labelTitle: "Đoàn ra",
  fileFolder: "doan-ra",
  searchPlaceholder: "Tìm theo danh nghĩa, trưởng đoàn, đơn vị, đối tác…",
  sectionTitles: {
    1: "Thời gian",
    2: "Danh nghĩa đoàn",
    3: "Trưởng đoàn",
    4: "Thành phần đoàn",
    5: "Đơn vị chủ trì",
    6: "Nguồn kinh phí",
    7: "Nội dung & đối tác",
    8: "Chương trình làm việc",
    9: "Hình ảnh",
    10: "Hồ sơ",
  },
  filters: [
    { key: "cap", column: "cap", emptyLabel: "Mọi cấp", options: CAP_RA_OPTIONS },
    { key: "noiDung", column: "noi_dung_lam_viec", emptyLabel: "Mọi nội dung", options: NOI_DUNG_RA_OPTIONS },
  ],
  fields: [
    {
      key: "thoiGian",
      column: ["thoi_gian_tu", "thoi_gian_den"] as [string, string],
      label: "Thời gian (Từ → Đến)",
      type: "date-range",
      section: 1,
      required: true,
      inTable: true,
    },

    { key: "danhNghia", column: "danh_nghia", label: "Danh nghĩa / Tên đoàn", type: "text", section: 2, required: true, inTable: true, searchable: true, placeholder: "Tên đoàn ra" },
    { key: "quocGiaCongTac", column: "quoc_gia_den_cong_tac", label: "Quốc gia đến công tác", type: "multi-search", section: 2, options: QUOC_GIA_OPTIONS, inTable: true, searchable: true, placeholder: "Gõ tên quốc gia rồi chọn (có thể chọn nhiều)" },
    { key: "cap", column: "cap", label: "Cấp", type: "select", section: 2, options: CAP_RA_OPTIONS, inTable: true, searchable: true, badge: "accent" },

    { key: "tdHoTen", column: "td_ho_ten", label: "Họ & tên", type: "text", section: 3, group: "Trưởng đoàn", inTable: true, searchable: true },
    { key: "tdCoQuan", column: "td_co_quan", label: "Cơ quan / Tổ chức", type: "text", section: 3, group: "Trưởng đoàn", searchable: true },
    { key: "tdLyLich", column: "td_ly_lich_path", label: "Lý lịch", type: "file", section: 3, group: "Trưởng đoàn" },

    { key: "soNguoi", column: "so_nguoi", label: "Số người", type: "number", section: 4, group: "Thành phần đoàn", inTable: true },
    { key: "dsThanhVien", column: "ds_thanh_vien_path", label: "DS thành viên đoàn", type: "file", section: 4, group: "Thành phần đoàn" },

    { key: "donViChuTri", column: "don_vi_chu_tri", label: "Đơn vị chủ trì", type: "search", section: 5, options: DON_VI_OPTIONS, inTable: true, searchable: true, placeholder: "Tên đơn vị trong HV" },

    { key: "nguonKinhPhi", column: "nguon_kinh_phi", label: "Nguồn kinh phí", type: "multi-select", section: 6, options: NGUON_KP_OPTIONS, searchable: true },
    { key: "nguonKinhPhiKhac", column: "nguon_kinh_phi_khac", label: "Khác — ghi rõ (nếu chọn \"Khác\")", type: "text", section: 6, placeholder: "Mô tả nguồn kinh phí khác", fullWidth: true },

    { key: "noiDungLamViec", column: "noi_dung_lam_viec", label: "Nội dung làm việc", type: "select", section: 7, options: NOI_DUNG_RA_OPTIONS, inTable: true, searchable: true, badge: "amber" },
    { key: "doiTac", column: "doi_tac", label: "Đối tác / nơi làm việc", type: "multi-text", section: 7, searchable: true, placeholder: "Tên đối tác / địa điểm" },
    { key: "thongTinDoiTac", column: "thong_tin_doi_tac_path", label: "Thông tin đối tác", type: "file", section: 7 },

    { key: "chuongTrinh", column: "chuong_trinh_path", label: "Chương trình làm việc", type: "file", section: 8 },
    { key: "hinhAnh", column: "hinh_anh_paths", label: "Hình ảnh", type: "file", section: 9, multiple: true },
    { key: "hoSo", column: "ho_so_paths", label: "Hồ sơ (Quyết định, Chương trình, Báo cáo)", type: "file", section: 10, multiple: true },
  ],
};
