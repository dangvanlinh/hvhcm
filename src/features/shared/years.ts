// Danh sách năm cho ô lọc "Năm" ở phần Tra cứu.
// Mặc định: từ YEAR_START đến NĂM HIỆN TẠI → mỗi năm mới tự xuất hiện
// (vd sang 2027 sẽ tự có 2027, KHÔNG cần sửa code).
// Muốn bắt đầu sớm hơn 2025 thì chỉ cần đổi YEAR_START bên dưới.
export const YEAR_START = 2025;

// Trả về danh sách năm (chuỗi, giảm dần). `extra` = các năm có trong dữ liệu
// để gộp vào (phòng khi đã nhập đoàn ở năm ngoài khoảng mặc định).
export function yearOptions(extra: number[] = []): string[] {
  const now = new Date().getFullYear();
  const end = Math.max(now, YEAR_START);
  const set = new Set<number>();
  for (let y = YEAR_START; y <= end; y++) set.add(y);
  for (const e of extra) if (Number.isFinite(e)) set.add(e);
  return [...set].sort((a, b) => b - a).map(String);
}
