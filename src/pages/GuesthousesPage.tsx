import { useState } from "react";
import { trpc } from "@/providers/trpc";

function KgstdPanel({ gh, onUpdate }: { gh: any; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();
  const updateKgstd = trpc.guesthouses.updateKgstd.useMutation({
    onSuccess: () => {
      utils.guesthouses.list.invalidate();
      onUpdate();
    },
  });

  const { data: criteria } = trpc.guesthouses.kgstdCriteria.useQuery();

  const currentAnswers: Record<string, string> = { ...JSON.parse(gh.kgstdAnswers || "{}"), ...answers };

  const getStarColor = (stars: number | null) => {
    const s = stars ?? 0;
    if (s >= 3) return "#2D5A3D";
    if (s >= 2) return "#C9973A";
    if (s >= 1) return "#8B6020";
    return "#8B2020";
  };

  const handleAnswer = (criterionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleSave = () => {
    updateKgstd.mutate({ ghId: gh.ghId, answers: currentAnswers });
    setEditing(false);
  };

  const criteriaByAspect = {
    "Социальный": criteria?.filter((c) => c.aspect === "Социальный") || [],
    "Экономический": criteria?.filter((c) => c.aspect === "Экономический") || [],
    "Экологический": criteria?.filter((c) => c.aspect === "Экологический") || [],
  };

  return (
    <div className="border-t border-white/5 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl" style={{ color: getStarColor(gh.kgstdStars) }}>
            {gh.kgstdScore}
          </span>
          <div>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`text-sm ${s <= (gh.kgstdStars ?? 0) ? "text-[#C9973A]" : "text-white/10"}`}>⭐</span>
              ))}
            </div>
            <p className="text-[10px] text-[#888888]">{gh.kgstdScore}/54 · {Math.round(gh.kgstdPct ?? 0)}%</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-[#FAFAFA] hover:bg-white/5 transition-colors"
            >
              Редактировать
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs bg-[#C9973A] text-[#0A1017] rounded-lg font-medium"
              >
                Сохранить
              </button>
              <button
                onClick={() => { setEditing(false); setAnswers({}); }}
                className="px-3 py-1.5 text-xs border border-white/10 rounded-lg text-[#FAFAFA]"
              >
                Отмена
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 text-xs text-[#888888] hover:text-[#FAFAFA] transition-colors"
          >
            {expanded ? "Скрыть" : "Подробнее"}
          </button>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${gh.kgstdPct ?? 0}%`, backgroundColor: getStarColor(gh.kgstdStars) }}
        />
      </div>

      {expanded && criteria && (
        <div className="space-y-4">
          {Object.entries(criteriaByAspect).map(([aspect, items]) => (
            <div key={aspect}>
              <p className="tracked-small text-[#888888] mb-2">
                {aspect === "Социальный" ? "🤝" : aspect === "Экономический" ? "💼" : "🌿"} {aspect}
              </p>
              <div className="space-y-1.5">
                {items.map((c) => {
                  const answer = currentAnswers[c.criterionId] || "no";
                  return (
                    <div key={c.criterionId} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${answer === "yes" ? "bg-[#2D5A3D]" : answer === "partial" ? "bg-[#C9973A]" : "bg-[#888888]/30"}`} />
                        <span className="text-xs text-[#FAFAFA]/70">{c.name}</span>
                      </div>
                      {editing ? (
                        <div className="flex gap-1">
                          {["yes", "partial", "no"].map((v) => (
                            <button
                              key={v}
                              onClick={() => handleAnswer(c.criterionId, v)}
                              className={`px-2 py-0.5 text-[10px] rounded ${
                                answer === v ? "bg-[#C9973A] text-[#0A1017]" : "bg-white/5 text-[#888888]"
                              }`}
                            >
                              {v === "yes" ? "Да" : v === "partial" ? "Стадия" : "Нет"}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#888888]">
                          {answer === "yes" ? "Да" : answer === "partial" ? "Частично" : "Нет"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuesthousesPage() {
  const [expandedGh, setExpandedGh] = useState<string | null>(null);
  const { data: guesthouses, isLoading } = trpc.guesthouses.list.useQuery({});
  const utils = trpc.useUtils();

  const getStarColor = (stars: number | null) => {
    const s = stars ?? 0;
    if (s >= 3) return "#2D5A3D";
    if (s >= 2) return "#C9973A";
    if (s >= 1) return "#8B6020";
    return "#8B2020";
  };

  return (
    <div className="min-h-screen bg-[#0A1017] py-8 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-[#FAFAFA] mb-2">Жильё и юрты</h1>
          <p className="text-sm text-[#888888]">
            {guesthouses?.length || 0} объектов · KGSTD 2025 — стандарт устойчивого развития
          </p>
        </div>

        {/* Info box */}
        <div className="glass-panel rounded-xl p-4 mb-8 flex items-center gap-4">
          <div className="flex gap-1">
            <span className="text-sm text-[#C9973A]">⭐⭐⭐</span>
          </div>
          <p className="text-xs text-[#888888]">
            90–100% — отличный уровень · 70–89% — хороший · 50–69% — базовый · ниже 50% — требует улучшения
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))
          ) : (
            guesthouses?.map((gh) => (
              <div
                key={gh.ghId}
                className="glass-panel rounded-xl p-5 card-lift border border-transparent hover:border-[#C9973A]/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-[#FAFAFA] mb-1">{gh.name}</h3>
                    <p className="text-[11px] text-[#888888]">
                      {gh.city} · {gh.type} · {gh.season || "Круглый год"}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedGh(expandedGh === gh.ghId ? null : gh.ghId)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${getStarColor(gh.kgstdStars)}20`,
                      color: getStarColor(gh.kgstdStars),
                      border: `1px solid ${getStarColor(gh.kgstdStars)}40`,
                    }}
                  >
                    KGSTD {(gh.kgstdStars ?? 0) > 0 ? "⭐".repeat(gh.kgstdStars ?? 0) : "—"}
                  </button>
                </div>

                {/* Body */}
                <p className="text-xs text-[#888888] leading-relaxed mb-4">{gh.description}</p>

                <div className="flex items-center gap-3 mb-4 text-[11px] text-[#888888]">
                  <span>💰 {gh.pricePerNight.toLocaleString()} с/ночь</span>
                  <span>📅 {gh.season || "Круглый год"}</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-[#C9973A] text-[#0A1017] text-xs font-medium rounded-lg hover:bg-[#D4A84A] transition-colors">
                    Запросить
                  </button>
                  <button
                    onClick={() => setExpandedGh(expandedGh === gh.ghId ? null : gh.ghId)}
                    className="px-3 py-2 border border-white/10 text-[#FAFAFA] text-xs rounded-lg hover:bg-white/5 transition-colors"
                    style={{ borderColor: `${getStarColor(gh.kgstdStars ?? 0)}40` }}
                  >
                    KGSTD ♻️
                  </button>
                </div>

                {/* Expanded KGSTD panel */}
                {expandedGh === gh.ghId && (
                  <KgstdPanel gh={gh} onUpdate={() => utils.guesthouses.list.invalidate()} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
