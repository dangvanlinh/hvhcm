// Generic field/config types dùng chung cho Đoàn vào & Đoàn ra.
// Form, bảng tra cứu, modal chi tiết, edit mode đều render từ đây.

export type FieldType =
  | "date"
  | "date-range"   // 2 cột [tu, den]
  | "text"
  | "number"
  | "select"
  | "multi-select" // text[] — chọn nhiều từ options
  | "search"       // text + datalist gợi ý
  | "multi-text"   // text[] — repeater dòng text tự do
  | "file";

export interface FieldDef {
  key: string;
  // Cột DB. Với "date-range" và file multiple thì kiểu vẫn là 1 cột (text[]),
  // riêng date-range dùng tuple [cot_tu, cot_den].
  column: string | [string, string];
  label: string;
  type: FieldType;
  group?: string;        // tiêu đề subgroup (gạch trái)
  section: number;
  required?: boolean;
  options?: readonly string[];
  multiple?: boolean;    // cho file (lưu text[])
  inTable?: boolean;
  searchable?: boolean;  // tham gia ô tìm tự do
  placeholder?: string;
  badge?: "accent" | "amber"; // cho hiển thị badge ở bảng
  fullWidth?: boolean;   // ép chiếm full hàng trong form
}

export interface FilterDef {
  key: string;
  column: string;
  emptyLabel: string;        // "Mọi cấp"
  options: readonly string[];
}

export interface EntityConfig {
  table: string;                 // tên bảng DB
  branch: "vao" | "ra";
  label: string;                 // "đoàn vào"
  labelTitle: string;            // "Đoàn vào"
  fileFolder: string;            // folder trong storage
  fields: FieldDef[];
  sectionTitles: Record<number, string>;
  filters: FilterDef[];
  searchPlaceholder: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────
export const isFileField = (f: FieldDef) => f.type === "file";
export const isMultiCol = (f: FieldDef) =>
  f.type === "multi-select" ||
  f.type === "multi-text" ||
  (f.type === "file" && !!f.multiple);

export const primaryColumn = (f: FieldDef): string =>
  Array.isArray(f.column) ? f.column[0] : f.column;
