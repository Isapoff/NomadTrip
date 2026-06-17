import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useMapStore } from "@/store/mapStore";
import BookingModal from "@/components/booking/BookingModal";
import { routeImage } from "@/lib/images";

const REGIONS = ["Все", "Иссык-Куль", "Бишкек", "Нарын", "Ош", "Жалал-Абад", "Талас", "Баткен"];

const typeEmojis: Record<string, string> = {
  "Треккинг": "🏔", "Горнолыжный": "⛷", "Водный": "🌊", "Оздоровительный": "💆",
  "Историко-культурный": "🏛", "Экотуризм": "🌿", "Городской": "🏙", "Конный": "🐴",
  "Альпинизм": "🧗", "Рафтинг": "🚣", "Гастрономический": "🍽", "Этнокультурный": "🎭",
  "Пляжно-экскурсионный": "🏖", "Автотур": "🚗", "Комбинированный": "🗺", "Паломнический": "🕌",
  "Спортивный": "🏋", "Бюджетный": "💰",
};

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState("Все");
  const [bookingRoute, setBookingRoute] = useState<any>(null);
  const { data: routes, isLoading } = trpc.routes.list.useQuery({ region: activeRegion === "Все" ? undefined : activeRegion });
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!routes) return [];
    if (!search.trim()) return routes;
    const q = search.toLowerCase();
    return routes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [routes, search]);

  const handleMapClick = (route: any) => {
    setActiveRoute(route.routeId);
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-[#0A1017] py-8 px-6 lg:px-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <p className="section-label mb-2">Каталог</p>
        <div className="flex items-center gap-4">
          <h1 className="font-display text-3xl md:text-4xl text-[#FAFAFA]">Все маршруты</h1>
          <span className="px-3 py-1 bg-[#1A3A5C]/50 text-[#C9973A] text-xs rounded-full font-medium">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8 space-y-4">
        <input
          type="text"
          placeholder="Поиск по названию или региону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-hairline w-full max-w-md py-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                activeRegion === region
                  ? "bg-[#C9973A] text-[#0A1017] font-medium"
                  : "bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#FAFAFA]"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
                <div className="h-20 bg-white/5 rounded-lg mb-3" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))
          : filtered.map((route) => (
              <div
                key={route.routeId}
                className="glass-panel rounded-xl overflow-hidden card-lift group"
              >
                {/* Thumb */}
                <div className="keep-dark relative h-[140px] overflow-hidden">
                  <img
                    src={routeImage(route)}
                    alt={route.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1017]/70 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0A1017]/70 backdrop-blur text-sm rounded-full">
                    {typeEmojis[route.type] || "🗺"}
                  </span>
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#0A1017]/70 backdrop-blur text-[10px] text-[#FAFAFA] rounded-full">
                    {route.difficulty}/10
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#C9973A] mb-1">
                    {route.region}
                  </p>
                  <h3 className="text-sm font-medium text-[#FAFAFA] mb-2 leading-tight line-clamp-2">
                    {route.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-[#888888] mb-3">
                    <span>⏱ {route.durationDays} дн</span>
                    <span>💰 {route.budgetPerDay.toLocaleString()} с</span>
                    <span>⭐ {route.rating}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBookingRoute(route)}
                      className="flex-1 py-2 bg-[#C9973A] text-[#0A1017] text-xs font-medium rounded-lg hover:bg-[#D4A84A] transition-colors"
                    >
                      Бронь
                    </button>
                    <button
                      onClick={() => handleMapClick(route)}
                      className="px-3 py-2 border border-white/10 text-[#FAFAFA] text-xs rounded-lg hover:bg-white/5 transition-colors"
                    >
                      🗺 Карта
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
