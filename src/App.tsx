import { useMemo, useState } from "react";
import EntityForm from "./features/shared/EntityForm";
import EntityList from "./features/shared/EntityList";
import { DOAN_VAO_CONFIG } from "./features/doan-vao/fields";
import { DOAN_RA_CONFIG } from "./features/doan-ra/fields";
import type { EntityConfig } from "./features/shared/fieldTypes";

// Tạm chưa gắn login. Khi tích hợp WSO2 SSO sẽ:
//   1. Thêm route /auth/callback xử lý OIDC code → id_token
//   2. Bọc <App> bằng <AuthProvider>, redirect khi chưa login.
// Hiện tại RLS Supabase đang mở cho anon (xem supabase/schema.sql).

const CONFIGS: Record<"vao" | "ra", EntityConfig> = {
  vao: DOAN_VAO_CONFIG,
  ra: DOAN_RA_CONFIG,
};

export default function App() {
  const [branch, setBranch] = useState<"vao" | "ra">("vao");
  const [tab, setTab] = useState<"nhap" | "tra">("nhap");
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const config = useMemo(() => CONFIGS[branch], [branch]);

  function switchBranch(b: "vao" | "ra") {
    if (b === branch) return;
    setBranch(b);
    setEditing(null);
    setTab("nhap");
    setRefreshKey((k) => k + 1);
  }

  function startEdit(row: Record<string, any>) {
    setEditing(row);
    setTab("nhap");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSaved() {
    setEditing(null);
    setRefreshKey((k) => k + 1);
    setTab("tra");
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <header className="flex items-center gap-3 pb-4 mb-5 border-b border-line animate-rise">
        <Seal />
        <div>
          <h1 className="font-serif text-xl font-semibold">Quản lý Đoàn</h1>
          <p className="text-xs text-neutral-500">Lưu trữ & tra cứu thông tin đoàn theo thời gian</p>
        </div>
      </header>

      <div className="flex gap-2 mb-5 animate-rise" style={{ animationDelay: "40ms" }}>
        {(["vao", "ra"] as const).map((b) => (
          <button
            key={b}
            onClick={() => switchBranch(b)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              branch === b
                ? "bg-accent text-white border border-accent"
                : "bg-card text-neutral-500 border border-line hover:border-accent-2 hover:text-accent"
            }`}
          >
            {CONFIGS[b].labelTitle}
          </button>
        ))}
      </div>

      <div className="inline-flex gap-1 bg-line/40 p-1 rounded-xl mb-5 animate-rise" style={{ animationDelay: "80ms" }}>
        {(["nhap", "tra"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "tra") setRefreshKey((k) => k + 1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? "bg-card shadow-sm text-ink" : "text-neutral-500 hover:text-ink"
            }`}
          >
            {t === "nhap" ? (editing ? "Sửa bản ghi" : "Nhập liệu") : "Tra cứu"}
          </button>
        ))}
      </div>

      {tab === "nhap" ? (
        <EntityForm
          config={config}
          initial={editing}
          onSaved={onSaved}
          onCancelEdit={() => {
            setEditing(null);
            setTab("tra");
          }}
        />
      ) : (
        <EntityList config={config} refreshKey={refreshKey} onEdit={startEdit} />
      )}
    </div>
  );
}

function Seal() {
  return (
    <div className="w-11 h-11 rounded-xl bg-accent text-white grid place-items-center font-serif text-xl font-semibold shadow-[0_6px_18px_rgba(20,84,62,.22)]">
      Đ
    </div>
  );
}
