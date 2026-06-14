import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase, uploadFile } from "../../lib/supabase";
import type { EntityConfig, FieldDef } from "./fieldTypes";
import { isFileField, primaryColumn } from "./fieldTypes";

type Row = Record<string, any>;

interface State {
  text: Record<string, string>;
  range: Record<string, { from: string; to: string }>;
  multi: Record<string, string[]>;       // multi-select / multi-text
  files: Record<string, FileList | null>;
  kept: Record<string, string | string[] | null>; // edit mode — file paths giữ lại
}

function emptyState(fields: FieldDef[]): State {
  const text: Record<string, string> = {};
  const range: Record<string, { from: string; to: string }> = {};
  const multi: Record<string, string[]> = {};
  for (const f of fields) {
    if (f.type === "date-range") range[f.key] = { from: "", to: "" };
    else if (f.type === "multi-select" || f.type === "multi-search" || f.type === "multi-text") multi[f.key] = [];
    else if (!isFileField(f)) text[f.key] = "";
  }
  return { text, range, multi, files: {}, kept: {} };
}

function stateFromRow(fields: FieldDef[], row: Row): State {
  const s = emptyState(fields);
  for (const f of fields) {
    if (f.type === "date-range" && Array.isArray(f.column)) {
      s.range[f.key] = {
        from: row[f.column[0]] ?? "",
        to: row[f.column[1]] ?? "",
      };
    } else if (f.type === "multi-select" || f.type === "multi-search" || f.type === "multi-text") {
      const col = primaryColumn(f);
      s.multi[f.key] = Array.isArray(row[col]) ? row[col] : [];
    } else if (isFileField(f)) {
      const col = primaryColumn(f);
      s.kept[f.key] = row[col] ?? null;
    } else {
      const col = primaryColumn(f);
      s.text[f.key] = row[col] == null ? "" : String(row[col]);
    }
  }
  return s;
}

export default function EntityForm({
  config,
  initial,
  onSaved,
  onCancelEdit,
}: {
  config: EntityConfig;
  initial: Row | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
}) {
  const [state, setState] = useState<State>(() =>
    initial ? stateFromRow(config.fields, initial) : emptyState(config.fields)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState(initial ? stateFromRow(config.fields, initial) : emptyState(config.fields));
    setError(null);
  }, [initial, config]);

  const sections = useMemo(
    () => [...new Set(config.fields.map((f) => f.section))],
    [config]
  );

  const valid = config.fields.filter((f) => f.required).every((f) => {
    if (f.type === "date-range") {
      const r = state.range[f.key];
      return r?.from && r?.to;
    }
    return state.text[f.key]?.trim();
  });

  async function uploadIfChanged(f: FieldDef) {
    const fl = state.files[f.key];
    if (!fl || fl.length === 0) return state.kept[f.key] ?? null;
    if (f.multiple) {
      const paths: string[] = [];
      for (const file of Array.from(fl)) paths.push(await uploadFile(file, config.fileFolder));
      return paths;
    }
    return uploadFile(fl[0], config.fileFolder);
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const row: Row = {};
      for (const f of config.fields) {
        if (f.type === "date-range" && Array.isArray(f.column)) {
          const r = state.range[f.key];
          row[f.column[0]] = r.from || null;
          row[f.column[1]] = r.to || null;
        } else if (f.type === "multi-select" || f.type === "multi-search" || f.type === "multi-text") {
          const arr = state.multi[f.key].map((s) => s.trim()).filter(Boolean);
          row[primaryColumn(f)] = arr.length ? arr : null;
        } else if (isFileField(f)) {
          row[primaryColumn(f)] = await uploadIfChanged(f);
        } else {
          const v = state.text[f.key]?.trim() || null;
          row[primaryColumn(f)] = f.type === "number" && v != null ? Number(v) : v;
        }
      }
      const q = initial?.id
        ? supabase.from(config.table).update(row).eq("id", initial.id)
        : supabase.from(config.table).insert(row);
      const { error } = await q;
      if (error) throw error;
      onSaved();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (initial && onCancelEdit) {
      onCancelEdit();
    } else {
      setState(emptyState(config.fields));
    }
  }

  return (
    <div className="space-y-3.5 animate-rise">
      {sections.map((sec) => {
        const fieldsInSec = config.fields.filter((f) => f.section === sec);
        const groups = groupByLabel(fieldsInSec);
        return (
          <section key={sec} className="bg-card border border-line rounded-2xl px-5 py-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-accent-soft text-accent grid place-items-center text-sm font-semibold">{sec}</span>
              <h2 className="font-serif text-base font-semibold">{config.sectionTitles[sec]}</h2>
            </div>
            <div className="space-y-3">
              {groups.map((g, i) => (
                <div key={i} className={g.label ? "border-l-2 border-line/70 pl-4 ml-0.5" : ""}>
                  {g.label && <div className="text-xs font-medium text-neutral-500 mb-2">{g.label}</div>}
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3.5">
                    {g.fields.map((f) => (
                      <FieldRow
                        key={f.key}
                        def={f}
                        state={state}
                        setState={setState}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {error && <p className="text-sm text-red-700">Lỗi: {error}</p>}

      <div className="flex justify-end gap-2.5 pt-1">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl border border-line text-sm font-semibold text-neutral-500 hover:bg-white"
        >
          {initial ? "Huỷ sửa" : "Làm mới"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!valid || saving}
          className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-2 disabled:opacity-40 transition"
        >
          {saving ? "Đang lưu…" : initial ? "Cập nhật" : `Lưu ${config.label}`}
        </button>
      </div>
    </div>
  );
}

function groupByLabel(fields: FieldDef[]): { label?: string; fields: FieldDef[] }[] {
  const out: { label?: string; fields: FieldDef[] }[] = [];
  for (const f of fields) {
    const last = out[out.length - 1];
    if (last && last.label === f.group) last.fields.push(f);
    else out.push({ label: f.group, fields: [f] });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
function FieldRow({
  def,
  state,
  setState,
}: {
  def: FieldDef;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}) {
  const setText = (v: string) =>
    setState((s) => ({ ...s, text: { ...s.text, [def.key]: v } }));
  const setRange = (k: "from" | "to", v: string) =>
    setState((s) => ({
      ...s,
      range: { ...s.range, [def.key]: { ...s.range[def.key], [k]: v } },
    }));
  const setMulti = (arr: string[]) =>
    setState((s) => ({ ...s, multi: { ...s.multi, [def.key]: arr } }));
  const setFiles = (fl: FileList | null) =>
    setState((s) => ({ ...s, files: { ...s.files, [def.key]: fl } }));

  const base =
    "w-full px-3 py-2.5 rounded-lg border border-line bg-white text-sm transition focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/15";
  const fullWidth =
    def.fullWidth ||
    def.type === "file" ||
    def.type === "multi-text" ||
    def.type === "multi-select" ||
    def.type === "multi-search" ||
    def.type === "date-range";

  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium mb-1.5 text-neutral-700">
        {def.label}
        {def.required && <span className="text-red-600"> *</span>}
        {def.type === "file" && (
          <span className="text-neutral-400 font-normal text-xs"> (file{def.multiple ? ", nhiều" : ""})</span>
        )}
      </label>

      {def.type === "date" ? (
        <input
          type="date"
          value={state.text[def.key] ?? ""}
          onChange={(e) => setText(e.target.value)}
          className={base}
        />
      ) : def.type === "date-range" ? (
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={state.range[def.key]?.from ?? ""} onChange={(e) => setRange("from", e.target.value)} className={base} />
          <input type="date" value={state.range[def.key]?.to ?? ""} onChange={(e) => setRange("to", e.target.value)} className={base} />
        </div>
      ) : def.type === "number" ? (
        <input
          type="number"
          min={0}
          value={state.text[def.key] ?? ""}
          onChange={(e) => setText(e.target.value)}
          className={base}
          placeholder={def.placeholder ?? "0"}
        />
      ) : def.type === "select" ? (
        <select value={state.text[def.key] ?? ""} onChange={(e) => setText(e.target.value)} className={base}>
          <option value="">— Chọn —</option>
          {def.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : def.type === "search" ? (
        <>
          <input
            list={`dl-${def.key}`}
            value={state.text[def.key] ?? ""}
            onChange={(e) => setText(e.target.value)}
            className={base}
            placeholder={def.placeholder ?? "Gõ để tìm…"}
          />
          <datalist id={`dl-${def.key}`}>
            {def.options?.map((o) => <option key={o} value={o} />)}
          </datalist>
        </>
      ) : def.type === "multi-select" ? (
        <MultiSelect value={state.multi[def.key] ?? []} options={def.options ?? []} onChange={setMulti} />
      ) : def.type === "multi-search" ? (
        <MultiSearch idKey={def.key} value={state.multi[def.key] ?? []} options={def.options ?? []} onChange={setMulti} placeholder={def.placeholder} />
      ) : def.type === "multi-text" ? (
        <MultiText value={state.multi[def.key] ?? []} onChange={setMulti} placeholder={def.placeholder} />
      ) : def.type === "file" ? (
        <FileInput def={def} files={state.files[def.key]} kept={state.kept[def.key] ?? null} onFiles={setFiles} />
      ) : (
        <input type="text" value={state.text[def.key] ?? ""} onChange={(e) => setText(e.target.value)} className={base} placeholder={def.placeholder} />
      )}
    </div>
  );
}

function MultiSelect({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: readonly string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (o: string) =>
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-2 px-3 py-2.5 rounded-lg border border-line bg-white">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition ${
              on
                ? "bg-accent text-white border-accent"
                : "bg-white text-neutral-600 border-line hover:border-accent-2 hover:text-accent"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function MultiSearch({
  idKey,
  value,
  options,
  onChange,
  placeholder,
}: {
  idKey: string;
  value: string[];
  options: readonly string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const available = options.filter((o) => !value.includes(o));
  const add = (raw: string) => {
    const match = options.find((x) => x.toLowerCase() === raw.trim().toLowerCase());
    if (match && !value.includes(match)) onChange([...value, match]);
    setInput("");
  };
  const remove = (o: string) => onChange(value.filter((x) => x !== o));
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((o) => (
            <span key={o} className="inline-flex items-center gap-1 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-md bg-accent text-white">
              {o}
              <button type="button" onClick={() => remove(o)} className="hover:text-white/60" aria-label={`Bỏ ${o}`}>
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        list={`dl-ms-${idKey}`}
        value={input}
        onChange={(e) => {
          const v = e.target.value;
          if (options.some((x) => x === v)) add(v); // chọn từ danh sách → thêm ngay
          else setInput(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(input);
          }
        }}
        className="w-full px-3 py-2.5 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/15"
        placeholder={placeholder ?? "Gõ để tìm & chọn…"}
      />
      <datalist id={`dl-ms-${idKey}`}>
        {available.map((o) => <option key={o} value={o} />)}
      </datalist>
    </div>
  );
}

function MultiText({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const rows = value.length ? value : [""];
  const update = (i: number, v: string) => {
    const next = [...rows];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const add = () => onChange([...rows, ""]);
  const base =
    "flex-1 px-3 py-2.5 rounded-lg border border-line bg-white text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/15";
  return (
    <div className="space-y-2">
      {rows.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={v} onChange={(e) => update(i, e.target.value)} className={base} placeholder={placeholder ?? "Thêm…"} />
          {rows.length > 1 && (
            <button type="button" onClick={() => remove(i)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md">
              <X size={15} />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-2 font-medium">
        <Plus size={14} /> Thêm dòng
      </button>
    </div>
  );
}

function FileInput({
  def,
  files,
  kept,
  onFiles,
}: {
  def: FieldDef;
  files: FileList | null | undefined;
  kept: string | string[] | null;
  onFiles: (fl: FileList | null) => void;
}) {
  const keptArr = Array.isArray(kept) ? kept : kept ? [kept] : [];
  const base =
    "w-full px-3 py-2 rounded-lg border border-line bg-paper text-xs text-neutral-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-accent-soft file:text-accent file:font-medium file:cursor-pointer";
  return (
    <div className="space-y-1.5">
      <input
        type="file"
        multiple={def.multiple}
        accept={def.key === "hinhAnh" ? "image/*" : undefined}
        onChange={(e) => onFiles(e.target.files)}
        className={base}
      />
      {keptArr.length > 0 && !files?.length && (
        <p className="text-xs text-accent bg-accent-soft inline-block px-2.5 py-1 rounded-md">
          Đang có: {keptArr.map((p) => p.split("/").pop()).join(", ")} — chọn file mới để thay
        </p>
      )}
    </div>
  );
}
