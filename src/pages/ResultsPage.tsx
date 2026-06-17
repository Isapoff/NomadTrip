import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";
import { useMapStore } from "@/store/mapStore";
import BookingModal from "@/components/booking/BookingModal";

const typeEmojis: Record<string, string> = {
  "Треккинг": "🏔", "Горнолыжный": "⛷", "Водный": "🌊", "Оздоровительный": "💆",
  "Историко-культурный": "🏛", "Экотуризм": "🌿", "Городской": "🏙", "Конный": "🐴",
  "Альпинизм": "🧗", "Рафтинг": "🚣", "Гастрономический": "🍽", "Этнокультурный": "🎭",
  "Пляжно-экскурсионный": "🏖", "Автотур": "🚗", "Комбинированный": "🗺", "Паломнический": "🕌",
  "Спортивный": "🏋", "Бюджетный": "💰",
};

export default function ResultsPage() {
  const { results, recommending } = useQuizStore();
  const [bookingRoute, setBookingRoute] = useState<any>(null);
  const navigate = useNavigate();
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const setFlyTo = useMapStore((s) => s.setFlyTo);

  const borderColors = ["#C9973A", "#8899AA", "rgba(255,255,255,0.1)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0.06)"];

  const handleMapClick = (route: any) => {
    setActiveRoute(route.routeId);
    if (route.startLat && route.startLng) {
      setFlyTo([route.startLat, route.startLng], 9);
    }
    navigate("/map");
  };

  if (recommending) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0A1017] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#C9973A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#FAFAFA] font-serif text-lg italic">Анализируем 47 маршрутов...</p>
          <p className="text-xs text-[#888888] mt-2">WSM-алгоритм подбора</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0A1017] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#FAFAFA] font-serif text-lg italic mb-4">Сначала пройдите анкету</p>
          <Link to="/quiz" className="btn-gold px-6 py-3 rounded-xl text-sm font-medium inline-block">
            Перейти к анкете
          </Link>
        </div>
      </div>
    );
  }

  const { profile, profileInfo, totalFound, results: topRoutes } = results;

  return (
    <div className="min-h-screen bg-[#0A1017] py-8 px-6 lg:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Profile banner */}
        <motion.div
          className="glass-panel rounded-2xl p-6 lg:p-8 mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{profileInfo?.emoji || "🏔"}</span>
            <div>
              <p className="section-label mb-1">ВАШ ПРОФИЛЬ</p>
              <h1 className="font-display text-3xl text-[#FAFAFA]">
                {profileInfo?.name || profile}
              </h1>
              <p className="font-serif italic text-[#888888] mt-1">
                {profileInfo?.description || ""}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-4 py-2 bg-[#1A3A5C]/50 text-[#C9973A] rounded-full text-sm font-medium">
                {totalFound} маршрутов
              </span>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="space-y-6">
          {topRoutes?.map((result: any, i: number) => {
            const route = result.route;
            const borderColor = borderColors[i] || borderColors[2];
            const isFirst = i === 0;

            return (
              <motion.div
                key={route.routeId}
                className="glass-panel rounded-xl overflow-hidden"
                style={{ borderLeft: `3px solid ${borderColor}` }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="p-5 lg:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded ${isFirst ? "bg-[#C9973A] text-[#0A1017]" : "bg-white/5 text-[#888888]"}`}>
                          №{i + 1} {isFirst ? "· Лучшее совпадение" : ""}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl lg:text-2xl text-[#FAFAFA]">
                        {route.name}
                      </h3>
                      <p className="text-xs text-[#888888] mt-1">
                        {route.region} · {route.durationDays} дней · от {route.budgetPerDay.toLocaleString()} сом · сложность {route.difficulty}/10
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-display text-4xl ${isFirst ? "text-[#C9973A]" : "text-[#888888]"}`}>
                        {result.score}
                      </span>
                      <p className="text-[10px] text-[#888888] uppercase tracking-wider">WSM Score</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-white/5 rounded text-[10px] text-[#FAFAFA]/80">
                      {typeEmojis[route.type] || "🗺"} {route.type}
                    </span>
                    <span className="px-2.5 py-1 bg-white/5 rounded text-[10px] text-[#FAFAFA]/80">
                      {route.season}
                    </span>
                    <span className="px-2.5 py-1 bg-white/5 rounded text-[10px] text-[#FAFAFA]/80">
                      {route.transport}
                    </span>
                    <span className="px-2.5 py-1 bg-white/5 rounded text-[10px] text-[#FAFAFA]/80">
                      ⭐ {route.rating}
                    </span>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 border-l-2 border-[#C9973A] bg-[#C9973A]/5 rounded-r-lg mb-4">
                    <p className="text-xs text-[#FAFAFA]/80">{result.explanation}</p>
                  </div>

                  {/* Score bars */}
                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {[
                      { label: "Природа", value: result.componentScores?.nature || 0, color: "#2D5A3D" },
                      { label: "Культура", value: result.componentScores?.culture || 0, color: "#C9973A" },
                      { label: "Комфорт", value: result.componentScores?.comfort || 0, color: "#1A3A5C" },
                      { label: "Стоимость", value: result.componentScores?.cost || 0, color: "#1A6B8A" },
                      { label: "Приключения", value: result.componentScores?.adventure || 0, color: "#8B2020" },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[9px] text-[#888888] mb-1">
                          <span>{bar.label}</span>
                          <span>{bar.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingRoute(route)}
                      className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isFirst ? "btn-gold" : "bg-white/5 text-[#FAFAFA] hover:bg-white/10"
                      }`}
                    >
                      Забронировать
                    </button>
                    <button
                      onClick={() => handleMapClick(route)}
                      className="px-5 py-2.5 border border-white/10 text-[#FAFAFA] text-sm rounded-lg hover:bg-white/5 transition-colors"
                    >
                      🗺 На карте
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Retake */}
        <div className="text-center mt-10">
          <Link
            to="/quiz"
            className="text-sm text-[#888888] hover:text-[#D4F87A] transition-colors"
          >
            ← Пройти анкету заново
          </Link>
        </div>
      </div>

      {bookingRoute && (
        <BookingModal
          isOpen={!!bookingRoute}
          onClose={() => setBookingRoute(null)}
          routeName={bookingRoute.name}
          routeId={bookingRoute.routeId}
          region={bookingRoute.region}
          days={bookingRoute.durationDays}
          pricePerDay={bookingRoute.budgetPerDay}
        />
      )}
    </div>
  );
}
