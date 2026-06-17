import { useState, useEffect, type ReactNode } from "react";
import { X, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export type FieldType = "text" | "number" | "textarea" | "select";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  hint?: string;
  full?: boolean; // span 2 columns
}

type FormValues = Record<string, string | number | undefined>;

// ── Single form field ───────────────────────────────────────────
function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string | number | undefined;
  onChange: (v: string) => void;
}) {
  const base =
    "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#555] focus:outline-none focus:border-[#2D5A3D] transition-colors";
  return (
    <div className={def.full ? "sm:col-span-2" : ""}>
      <label className="text-[10px] text-[#888888] uppercase tracking-wider mb-1 block">
        {def.label}
        {def.hint && <span className="text-[#555] normal-case ml-1">· {def.hint}</span>}
      </label>
      {def.type === "textarea" ? (
        <textarea
          rows={3}
          value={value ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base + " resize-y"}
        />
      ) : def.type === "select" ? (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          <option value="">—</option>
          {def.options?.map((o) => (
            <option key={o} value={o} className="bg-[#0A1017]">
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={def.type === "number" ? "number" : "text"}
          value={value ?? ""}
          min={def.min}
          max={def.max}
          step={def.step}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </div>
  );
}

// ── Modal wrapper ────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl my-8 bg-[#0E1620] border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-[#0E1620] rounded-t-2xl">
          <h3 className="font-display text-lg text-[#FAFAFA]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Generic CRUD panel ───────────────────────────────────────────
export interface CrudPanelProps<Row extends { id: number }> {
  title: string;
  addLabel: string;
  rows: Row[];
  isLoading: boolean;
  columns: { key: string; label: string; render?: (r: Row) => ReactNode }[];
  fields: FieldDef[];
  emptyValues: FormValues;
  toForm: (r: Row) => FormValues;
  onSave: (
    id: number | null,
    values: FormValues,
  ) => Promise<{ success?: boolean; error?: string }>;
  onDelete: (id: number) => Promise<unknown>;
}

export function CrudPanel<Row extends { id: number }>({
  title,
  addLabel,
  rows,
  isLoading,
  columns,
  fields,
  emptyValues,
  toForm,
  onSave,
  onDelete,
}: CrudPanelProps<Row>) {
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<FormValues>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing === "new") setForm({ ...emptyValues });
    else if (editing) setForm(toForm(editing));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const coerce = (values: FormValues): FormValues => {
    const out: FormValues = {};
    for (const def of fields) {
      const raw = values[def.key];
      if (def.type === "number") {
        const n =
          raw === "" || raw === undefined || raw === null
            ? undefined
            : Number(raw);
        out[def.key] = Number.isNaN(n as number) ? undefined : n;
      } else {
        out[def.key] =
          raw === "" || raw === undefined ? undefined : String(raw);
      }
    }
    return out;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const id = editing === "new" ? null : (editing as Row).id;
      const res = await onSave(id, coerce(form));
      if (res && res.success === false) {
        setError(res.error || "Не удалось сохранить");
      } else {
        setEditing(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Row) => {
    if (!confirm("Удалить запись? Действие необратимо.")) return;
    await onDelete(row.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-[#FAFAFA]">{title}</h2>
        <button
          onClick={() => setEditing("new")}
          className="px-4 py-2 bg-[#C9973A] hover:bg-[#D4A84A] text-[#0A1017] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} /> {addLabel}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#2D5A3D]" />
        </div>
      ) : (
        <div className="glass-panel rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-[#888888]">
                {columns.map((c) => (
                  <th key={c.key} className="text-left font-medium px-4 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="text-center text-[#888888] py-10 text-xs"
                  >
                    Записей пока нет
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-[#E5E5E5] align-top">
                      {c.render
                        ? c.render(row)
                        : String((row as Record<string, unknown>)[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditing(row)}
                        title="Редактировать"
                        className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-[#C9973A] transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        title="Удалить"
                        className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-[#E25555] transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal
          title={editing === "new" ? addLabel : "Редактирование"}
          onClose={() => setEditing(null)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((def) => (
              <Field
                key={def.key}
                def={def}
                value={form[def.key]}
                onChange={(v) => setForm((f) => ({ ...f, [def.key]: v }))}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-[#E25555] bg-[#E25555]/10 border border-[#E25555]/20 rounded-lg px-3 py-2 mt-4">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#346b48] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Сохранить
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-5 py-2.5 text-sm text-[#888888] border border-white/10 rounded-lg hover:text-white transition-colors"
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
