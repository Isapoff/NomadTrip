import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Loader2, Pencil, Trash2, Phone, ExternalLink } from "lucide-react";

const STATUS_META: Record<
  string,
  { label: string; color: string }
> = {
  new: { label: "Новая", color: "#C9973A" },
  progress: { label: "В работе", color: "#1A6B8A" },
  confirmed: { label: "Подтверждена", color: "#1E7A45" },
  closed: { label: "Закрыта", color: "#888888" },
  cancelled: { label: "Отменена", color: "#B14B4B" },
};
const STATUS_ORDER = ["new", "progress", "confirmed", "closed", "cancelled"];

type Booking = {
  id: number;
  bookingId: string;
  routeName: string | null;
  routeId: string;
  name: string;
  phone: string;
  date: string | null;
  pax: number;
  total: number | null;
  comment: string | null;
  status: string;
  whatsappUrl: string | null;
  createdAt: Date | string;
};

export default function ProviderBookings() {
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<string>("all");
  const listQuery = trpc.booking.list.useQuery();
  const statsQuery = trpc.booking.stats.useQuery();

  const setStatusM = trpc.booking.setStatus.useMutation();
  const removeM = trpc.booking.remove.useMutation();
  const updateM = trpc.booking.update.useMutation();

  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    utils.booking.list.invalidate();
    utils.booking.stats.invalidate();
    utils.analytics.dashboard.invalidate();
  };

  const rows = (listQuery.data ?? []) as Booking[];
  const visible = filter === "all" ? rows : rows.filter((b) => b.status === filter);

  const changeStatus = async (id: number, status: string) => {
    await setStatusM.mutateAsync({ id, status: status as never });
    refresh();
  };

  const del = async (id: number) => {
    if (!confirm("Удалить заявку безвозвратно?")) return;
    await removeM.mutateAsync({ id });
    refresh();
  };

  const openEdit = (b: Booking) => {
    setEditing(b);
    setForm({
      name: b.name,
      phone: b.phone,
      date: b.date ?? "",
      pax: b.pax,
      total: b.total ?? 0,
      comment: b.comment ?? "",
      status: b.status,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateM.mutateAsync({
        id: editing.id,
        name: String(form.name),
        phone: String(form.phone),
        date: String(form.date),
        pax: Number(form.pax),
        total: Number(form.total),
        comment: String(form.comment),
        status: String(form.status) as never,
      });
      refresh();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const s = statsQuery.data;
  const inputCls =
    "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#555] focus:outline-none focus:border-[#2D5A3D]";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="font-display text-2xl text-[#FAFAFA]">Заявки</h2>
        {s && (
          <div className="flex gap-2 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-[#888888]">
              Всего: <span className="text-[#FAFAFA]">{s.total}</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#C9973A]/15 text-[#C9973A]">
              Новых: {s.new}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#1E7A45]/15 text-[#1E7A45]">
              Выручка: {s.revenue.toLocaleString("ru")} с
            </span>
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", ...STATUS_ORDER].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              filter === st
                ? "bg-[#2D5A3D] text-white"
                : "bg-white/[0.04] text-[#888888] hover:text-white"
            }`}
          >
            {st === "all" ? "Все" : STATUS_META[st].label}
          </button>
        ))}
      </div>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[#2D5A3D]" />
        </div>
      ) : visible.length === 0 ? (
        <div className="glass-panel rounded-xl text-center text-[#888888] py-14 text-sm">
          Заявок нет. Они появятся здесь автоматически, как только посетитель
          оформит бронь на сайте.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((b) => {
            const meta = STATUS_META[b.status] ?? STATUS_META.new;
            return (
              <div key={b.id} className="glass-panel rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#FAFAFA] font-medium">{b.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-xs text-[#888888]">
                      #{b.bookingId} · {b.routeName || b.routeId}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#B8B8B8] mt-2 flex-wrap">
                      <a href={`tel:${b.phone}`} className="flex items-center gap-1 hover:text-white">
                        <Phone size={11} /> {b.phone}
                      </a>
                      <span>{b.pax} чел.</span>
                      {b.date && <span>{b.date}</span>}
                      {b.total != null && <span>{b.total.toLocaleString("ru")} с</span>}
                    </div>
                    {b.comment && (
                      <div className="text-xs text-[#888888] mt-2 italic">«{b.comment}»</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={(e) => changeStatus(b.id, e.target.value)}
                      className="bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#2D5A3D]"
                    >
                      {STATUS_ORDER.map((st) => (
                        <option key={st} value={st} className="bg-[#0A1017]">
                          {STATUS_META[st].label}
                        </option>
                      ))}
                    </select>
                    {b.whatsappUrl && (
                      <a
                        href={b.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Открыть в WhatsApp"
                        className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-[#1E7A45]"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(b)}
                      title="Редактировать"
                      className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-[#C9973A]"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => del(b.id)}
                      title="Удалить"
                      className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center text-[#888888] hover:text-[#B14B4B]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg my-8 bg-[#0E1620] border border-white/10 rounded-2xl">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="font-display text-lg text-[#FAFAFA]">
                Заявка #{editing.bookingId}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { k: "name", l: "Имя", t: "text" },
                { k: "phone", l: "Телефон", t: "text" },
                { k: "date", l: "Дата", t: "text" },
                { k: "pax", l: "Кол-во человек", t: "number" },
                { k: "total", l: "Сумма, сом", t: "number" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="text-[10px] text-[#888888] uppercase tracking-wider mb-1 block">
                    {f.l}
                  </label>
                  <input
                    type={f.t}
                    value={form[f.k] ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, [f.k]: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider mb-1 block">
                  Статус
                </label>
                <select
                  value={form.status ?? "new"}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className={inputCls}
                >
                  {STATUS_ORDER.map((st) => (
                    <option key={st} value={st} className="bg-[#0A1017]">
                      {STATUS_META[st].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] text-[#888888] uppercase tracking-wider mb-1 block">
                  Комментарий
                </label>
                <textarea
                  rows={2}
                  value={form.comment ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                  className={inputCls + " resize-y"}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#346b48] disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Сохранить
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2.5 text-sm text-[#888888] border border-white/10 rounded-lg hover:text-white"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
