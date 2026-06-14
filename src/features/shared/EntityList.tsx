import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2, Search, Inbox } from "lucide-react";
import { supabase, signedUrl } from "../../lib/supabase";
import type { EntityConfig, FieldDef } from "./fieldTypes";
import { isFileField, primaryColumn } from "./fieldTypes";
import { yearOptions } from "./years";

type Row = Record<string, any>;

const fmtDate = (s: any) => {
  if (!s || typeof s !== "string") return "—";
  const [y, m, d] = s.split("-");
  return d && m && y ? `${d}-${m}-${y}` : s;
};

// Bề rộng tối thiểu/tối đa hợp lý theo loại cột để bảng cân đối, không bị bóp chật.
function colDims(f: FieldDef): React.CSSProperties {
  if (primaryColumn(f) === "danh_nghia") return { minWidth: 190, maxWidth: 240 };
  switch (f.type) {
    case "date":
    case "date-range":
      return { minWidth: 116, whiteSpace: "nowrap" };
    case "select":
      return { minWidth: 84 };
    case "number":
      return { minWidth: 64, whiteSpace: "nowrap" };
    case "multi-select":
    case "multi-search":
    case "multi-text":
      return { minWidth: 150, maxWidth: 230 };
    default:
      return { minWidth: 120, maxWidth: 200 };
  }
}

export default function EntityList({
  config,
  refreshKey,
  onEdit,
}: {
  config: EntityConfig;
  refreshKey: number;
  onEdit: (row: Row) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateF, setDateF] = useState<{ y: string; m: string; d: string }>({ y: "", m: "", d: "" });
  const [detail, setDetail] = useState<Row | null>(null);
  const [pendingDel, setPendingDel] = useState<Row | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from(config.table)
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
  }, [config, refreshKey]);

  const searchKeys = useMemo(
    () =>
      config.fields
        .filter((f) => f.searchable)
        .flatMap((f) => (Array.isArray(f.column) ? f.column : [f.column])),
    [config]
  );

  // Cột ngày để lọc theo năm/tháng/ngày (trường date hoặc date-range đầu tiên).
  const dateCols = useMemo(() => {
    const f = config.fields.find((x) => x.type === "date-range" || x.type === "date");
    if (!f) return [];
    return Array.isArray(f.column) ? f.column : [f.column];
  }, [config]);

  const years = useMemo(() => {
    const inData: number[] = [];
    for (const r of rows)
      for (const c of dateCols) {
        const v = r[c];
        if (typeof v === "string" && v.length >= 4) inData.push(Number(v.slice(0, 4)));
      }
    return yearOptions(inData);
  }, [rows, dateCols]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows
      .filter((r) =>
        Object.entries(filters).every(([col, v]) => !v || r[col] === v)
      )
      .filter((r) => {
        if (!dateF.y && !dateF.m && !dateF.d) return true;
        return dateCols.some((c) => {
          const v = r[c];
          if (typeof v !== "string" || v.length < 10) return false;
          const [y, m, d] = v.split("-");
          if (dateF.y && y !== dateF.y) return false;
          if (dateF.m && Number(m) !== Number(dateF.m)) return false;
          if (dateF.d && Number(d) !== Number(dateF.d)) return false;
          return true;
        });
      })
      .filter((r) => {
        if (!t) return true;
        return searchKeys.some((k) => {
          const v = r[k];
          if (Array.isArray(v)) return v.some((x) => String(x).toLowerCase().includes(t));
          return String(v ?? "").toLowerCase().includes(t);
        });
      });
  }, [rows, q, filters, searchKeys, dateF, dateCols]);

  async function confirmDelete() {
    if (!pendingDel) return;
    await supabase.from(config.table).delete().eq("id", pendingDel.id);
    setRows((rs) => rs.filter((r) => r.id !== pendingDel.id));
    setPendingDel(null);
  }

  const cols = config.fields.filter((f) => f.inTable);

  return (
    <div className="animate-rise">
      <div className="flex flex-wrap gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={config.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/15"
          />
        </div>
        {config.filters.map((f) => (
          <select
            key={f.key}
            value={filters[f.column] ?? ""}
            onChange={(e) => setFilters((s) => ({ ...s, [f.column]: e.target.value }))}
            className="px-3 py-2.5 rounded-lg border border-line bg-white text-sm min-w-[150px]"
          >
            <option value="">{f.emptyLabel}</option>
            {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {dateCols.length > 0 && (
          <>
            <select
              value={dateF.y}
              onChange={(e) => setDateF((s) => ({ ...s, y: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-line bg-white text-sm min-w-[110px]"
            >
              <option value="">Mọi năm</option>
              {years.map((y) => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <select
              value={dateF.m}
              onChange={(e) => setDateF((s) => ({ ...s, m: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-line bg-white text-sm min-w-[110px]"
            >
              <option value="">Mọi tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select
              value={dateF.d}
              onChange={(e) => setDateF((s) => ({ ...s, d: e.target.value }))}
              className="px-3 py-2.5 rounded-lg border border-line bg-white text-sm min-w-[110px]"
            >
              <option value="">Mọi ngày</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>Ngày {d}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-neutral-400 text-sm">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <Inbox size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              {rows.length === 0
                ? `Chưa có ${config.label} nào. Sang tab Nhập liệu để thêm.`
                : `Không tìm thấy ${config.label} nào khớp.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50/70 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide border-b border-line">
                  {cols.map((c) => (
                    <th key={c.key} className="px-3.5 py-2.5 whitespace-nowrap" style={{ minWidth: colDims(c).minWidth }}>{c.label}</th>
                  ))}
                  <th className="px-3.5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-line/50 last:border-0 hover:bg-neutral-50/60 transition">
                    {cols.map((c) => (
                      <td key={c.key} className="px-3.5 py-3 align-top leading-snug break-words" style={colDims(c)}>
                        <Cell def={c} row={r} />
                      </td>
                    ))}
                    <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                      <IconBtn title="Xem" onClick={() => setDetail(r)}><Eye size={15} /></IconBtn>
                      <IconBtn title="Sửa" onClick={() => onEdit(r)}><Pencil size={15} /></IconBtn>
                      <IconBtn title="Xoá" tone="danger" onClick={() => setPendingDel(r)}><Trash2 size={15} /></IconBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && <DetailModal config={config} row={detail} onClose={() => setDetail(null)} />}
      {pendingDel && (
        <ConfirmDelete
          name={pickName(config, pendingDel)}
          onCancel={() => setPendingDel(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function pickName(config: EntityConfig, row: Row): string {
  const f = config.fields.find((x) => x.column === "danh_nghia");
  return (f && (row[primaryColumn(f)] as string)) || "Không tên";
}

function Cell({ def, row }: { def: FieldDef; row: Row }) {
  if (def.type === "date") return <>{fmtDate(row[primaryColumn(def)])}</>;
  if (def.type === "date-range" && Array.isArray(def.column)) {
    const a = fmtDate(row[def.column[0]]);
    const b = fmtDate(row[def.column[1]]);
    if (a === "—" && b === "—") return <>—</>;
    return <span className="whitespace-nowrap">{a} → {b}</span>;
  }
  const v = row[primaryColumn(def)];
  if (Array.isArray(v)) return <>{v.length ? v.join(", ") : "—"}</>;
  if (def.badge && v) {
    const cls =
      def.badge === "accent"
        ? "bg-accent-soft text-accent border-accent-soft"
        : "bg-amber-50 text-amber-700 border-amber-100";
    return <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${cls}`}>{v}</span>;
  }
  return <>{v == null || v === "" ? "—" : String(v)}</>;
}

function IconBtn({
  children,
  title,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  tone?: "danger";
}) {
  const cls =
    tone === "danger"
      ? "hover:text-red-600 hover:bg-red-50"
      : "hover:text-accent hover:bg-accent-soft";
  return (
    <button title={title} onClick={onClick} className={`p-1.5 ml-0.5 text-neutral-400 rounded-md transition ${cls}`}>
      {children}
    </button>
  );
}

// ─── Detail modal ────────────────────────────────────────────────────────
function DetailModal({
  config,
  row,
  onClose,
}: {
  config: EntityConfig;
  row: Row;
  onClose: () => void;
}) {
  const groups = useMemo(() => {
    const out: { title: string; fields: FieldDef[] }[] = [];
    let cur: { title: string; fields: FieldDef[] } | null = null;
    for (const f of config.fields) {
      const t = f.group ?? config.sectionTitles[f.section];
      if (!cur || cur.title !== t) {
        cur = { title: t, fields: [] };
        out.push(cur);
      }
      cur.fields.push(f);
    }
    return out;
  }, [config]);

  return (
    <div
      className="fixed inset-0 bg-ink/40 flex items-start justify-center p-6 overflow-y-auto z-50 animate-fade"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-xl my-6 shadow-xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-serif text-lg font-semibold">Chi tiết {config.label}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-ink text-xl leading-none">✕</button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {groups.map((g, i) => (
            <div key={i}>
              <h4 className="font-serif text-sm font-semibold text-accent mb-2">{g.title}</h4>
              <dl className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-4 text-sm">
                {g.fields.map((f) => (
                  <DetailRow key={f.key} def={f} row={row} />
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ def, row }: { def: FieldDef; row: Row }) {
  let body: React.ReactNode;
  if (def.type === "date-range" && Array.isArray(def.column)) {
    const a = fmtDate(row[def.column[0]]);
    const b = fmtDate(row[def.column[1]]);
    body = a === "—" && b === "—" ? "—" : `${a} → ${b}`;
  } else if (def.type === "date") {
    body = fmtDate(row[primaryColumn(def)]);
  } else if (isFileField(def)) {
    body = <FileLinks value={row[primaryColumn(def)]} />;
  } else {
    const v = row[primaryColumn(def)];
    if (Array.isArray(v)) body = v.length ? v.join(", ") : "—";
    else body = v == null || v === "" ? "—" : String(v);
  }
  return (
    <>
      <dt className="text-neutral-500">{def.label}</dt>
      <dd className="font-medium">{body}</dd>
    </>
  );
}

function FileLinks({ value }: { value: string | string[] | null | undefined }) {
  const paths = Array.isArray(value) ? value : value ? [value] : [];
  const [urls, setUrls] = useState<{ path: string; url: string | null }[]>([]);
  const key = paths.join("|");
  useEffect(() => {
    Promise.all(paths.map(async (p) => ({ path: p, url: await signedUrl(p) }))).then(setUrls);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  if (paths.length === 0) return <>—</>;
  return (
    <span className="flex flex-col gap-0.5">
      {urls.map((u) => (
        <a key={u.path} href={u.url ?? "#"} target="_blank" rel="noreferrer" className="text-accent hover:underline text-sm">
          {u.path.split("/").pop()} ↓
        </a>
      ))}
    </span>
  );
}

// ─── Confirm delete ──────────────────────────────────────────────────────
function ConfirmDelete({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-6 z-50 animate-fade" onClick={onCancel}>
      <div className="bg-card rounded-2xl w-full max-w-sm p-5 shadow-xl animate-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-lg font-semibold mb-1">Xoá bản ghi này?</h3>
        <p className="text-sm text-neutral-500 mb-5">"{name}" sẽ bị xoá vĩnh viễn.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-line text-sm font-semibold text-neutral-500 hover:bg-white">Huỷ</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-semibold hover:bg-red-800">Xoá</button>
        </div>
      </div>
    </div>
  );
}
