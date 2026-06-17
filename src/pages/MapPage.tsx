import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useMapStore } from "@/store/mapStore";
import { useBuilderStore, type BuilderItem } from "@/store/builderStore";
import { routeSegments, nearbyObjects, optimizeOrder, formatHours } from "@/lib/geo";

const typeEmojis: Record<string, string> = {
  "Треккинг": "🏔", "Горнолыжный": "⛷", "Водный": "🌊", "Оздоровительный": "💆",
  "Историко-культурный": "🏛", "Экотуризм": "🌿", "Городской": "🏙", "Конный": "🐴",
  "Альпинизм": "🧗", "Рафтинг": "🚣", "Гастрономический": "🍽", "Этнокультурный": "🎭",
  "Пляжно-экскурсионный": "🏖", "Автотур": "🚗", "Комбинированный": "🗺", "Паломнический": "🕌",
  "Спортивный": "🏋", "Бюджетный": "💰",
};

const regionCosts: Record<string, number> = {
  "Иссык-Куль": 5000, "Нарын": 5500, "Ош": 3500,
  "Жалал-Абад": 4000, "Бишкек": 4500, "Талас": 3000, "Баткен": 4500,
};

const regionDays: Record<string, number> = {
  "Иссык-Куль": 2, "Нарын": 2.5, "Ош": 2, "Жалал-Абад": 2,
  "Бишкек": 1.5, "Талас": 1.5, "Баткен": 2,
};

export default function MapPage() {
  const [MapView, setMapView] = useState<any>(null);
  const [tab, setTab] = useState<"routes" | "build">("routes");
  const myRoute = useBuilderStore((st) => st.myRoute);
  const addItemToStore = useBuilderStore((st) => st.addItem);
  const removeItemFromStore = useBuilderStore((st) => st.removeItem);
  const setRoute = useBuilderStore((st) => st.setRoute);
  const clearStore = useBuilderStore((st) => st.clearItems);
  // Точки с координатами для карты
  const buildStops = useMemo(
    () => myRoute.filter((i) => i.lat != null && i.lng != null) as (BuilderItem & { lat: number; lng: number })[],
    [myRoute]
  );
  const [pax, setPax] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("Все");

  const activeRoute = useMapStore((s) => s.activeRoute);
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);
  const setFlyTo = useMapStore((s) => s.setFlyTo);

  const { data: routes } = trpc.routes.list.useQuery({});
  const { data: guesthouses } = trpc.guesthouses.list.useQuery({});
  const { data: objects } = trpc.objects.list.useQuery({});

  useEffect(() => {
    let mounted = true;
    import("@/components/map/MapViewEnhanced").then((mod) => {
      if (mounted) setMapView(() => mod.default);
    }).catch(() => {
      import("@/components/map/MapView").then((mod) => {
        if (mounted) setMapView(() => mod.default);
      });
    });
    return () => { mounted = false; };
  }, []);

  const activeRouteData = useMemo(() => {
    if (!activeRoute || !routes) return null;
    return routes.find((r) => r.routeId === activeRoute);
  }, [activeRoute, routes]);

  const regions = useMemo(() => {
    const rs = routes?.map(r => r.region) || [];
    return ["Все", ...Array.from(new Set(rs))];
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    if (!routes) return [];
    return routes.filter(r => {
      const matchRegion = regionFilter === "Все" || r.region === regionFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.region.toLowerCase().includes(q) || r.type?.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [routes, regionFilter, searchQuery]);

  const filteredObjects = useMemo(() => {
    if (!objects) return [];
    const q = searchQuery.toLowerCase();
    return objects.filter(o => {
      const matchRegion = regionFilter === "Все" || o.region === regionFilter;
      const matchSearch = !q || o.name.toLowerCase().includes(q) || o.region.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [objects, regionFilter, searchQuery]);

  const handleRouteClick = (route: any) => {
    setActiveRoute(route.routeId);
    setTab("routes");
    if (route.startLat && route.startLng) {
      setFlyTo([route.startLat, route.startLng], 9);
    }
  };

  const addStop = (obj: any) => {
    const id = obj.objectId || String(obj.id);
    addItemToStore({
      id,
      name: obj.name,
      lat: obj.lat,
      lng: obj.lng,
      category: obj.category || obj.type || "Достопримечательность",
      region: obj.region,
      description: obj.description || obj.desc || undefined,
      price: obj.price || 0,
      emoji: "📍",
    });
    if (obj.lat && obj.lng) setFlyTo([obj.lat, obj.lng], 11);
    setTab("build");
  };

  const removeStop = (id: string) => removeItemFromStore(id);
  const moveStop = (i: number, dir: -1 | 1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= myRoute.length) return;
    const updated = [...myRoute];
    [updated[i], updated[ni]] = [updated[ni], updated[i]];
    setRoute(updated);
  };

  // Trip estimate calculation
  const stopRegions = [...new Set(buildStops.map(s => s.region))];
  const { segments, totalKm, totalHours } = routeSegments(buildStops);
  const entryFees = buildStops.reduce((s, stop) => s + (stop.price || 0), 0);
  const estDays = Math.max(
    stopRegions.reduce((s, r) => s + (regionDays[r] || 2), 0) + totalHours / 8,
    buildStops.length * 0.7,
    1
  );
  const estDaysRounded = Math.ceil(estDays);
  const avgDailyBudget = stopRegions.length > 0
    ? stopRegions.reduce((s, r) => s + (regionCosts[r] || 4500), 0) / stopRegions.length
    : 4500;
  const accommodationCost = avgDailyBudget * 0.4 * estDaysRounded * pax;
  const foodCost = avgDailyBudget * 0.3 * estDaysRounded * pax;
  const transportCost = Math.max(Math.round(totalKm * 25) + 2000, 2000);
  const guideCost = buildStops.length >= 4 ? 5000 : 0;
  const totalEstimate = Math.round(accommodationCost + foodCost + transportCost + entryFees + guideCost);

  // Гео-подсказки: объекты рядом с маршрутом (до 60 км), которых ещё нет
  const suggestions = useMemo(() => {
    if (!objects || buildStops.length === 0) return [];
    const addedIds = new Set(buildStops.map(s => s.id));
    const candidates = objects.filter(o =>
      o.lat && o.lng && !addedIds.has(o.objectId || String(o.id))
    );
    return nearbyObjects(buildStops, candidates as any[], 60, 6);
  }, [objects, buildStops]);

  const handleOptimize = () => {
    setRoute(optimizeOrder(buildStops));
  };

  // Текст маршрута для WhatsApp / буфера обмена
  const routeText = () => {
    const lines = [
      "Мой маршрут по Кыргызстану (NOMADTRIP):",
      ...myRoute.map((s, i) => `${i + 1}. ${s.name} (${s.region})`),
      "",
      `Дней: ~${estDaysRounded} · Человек: ${pax}`,
      buildStops.length >= 2 ? `Путь: ${Math.round(totalKm)} км (~${formatHours(totalHours)})` : "",
      `Бюджет: ~${totalEstimate.toLocaleString()} сом (${Math.round(totalEstimate / pax).toLocaleString()} с/чел)`,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(routeText())}`, "_blank");
  };

  const copyRoute = async () => {
    try {
      await navigator.clipboard.writeText(routeText());
      alert("Маршрут скопирован — вставьте его в сообщение агентству или другу");
    } catch {
      alert(routeText());
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0A1017] grid grid-cols-1 lg:grid-cols-[340px_1fr]">
      {/* SIDEBAR */}
      <div className="glass-panel border-r border-white/5 overflow-y-auto scrollbar-thin flex flex-col">

        {/* Tab switcher */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setTab("routes")}
            className={`flex-1 py-3.5 text-xs uppercase tracking-wider transition-colors ${
              tab === "routes"
                ? "text-[#C9973A] border-b-2 border-[#C9973A] bg-[#C9973A]/5"
                : "text-[#888888] hover:text-[#FAFAFA]"
            }`}
          >
            🏕 Маршруты
          </button>
          <button
            onClick={() => setTab("build")}
            className={`flex-1 py-3.5 text-xs uppercase tracking-wider transition-colors ${
              tab === "build"
                ? "text-[#D4F87A] border-b-2 border-[#D4F87A] bg-[#D4F87A]/5"
                : "text-[#888888] hover:text-[#FAFAFA]"
            }`}
          >
            ✏️ Свой маршрут {myRoute.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#D4F87A]/20 text-[#D4F87A] rounded-full text-[9px]">
                {myRoute.length}
              </span>
            )}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="p-3 border-b border-white/5 flex-shrink-0 space-y-2">
          <input
            type="text"
            placeholder="Поиск маршрутов и объектов..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#FAFAFA] placeholder-[#555] focus:outline-none focus:border-white/20"
          />
          <div className="flex gap-1.5 flex-wrap">
            {regions.slice(0, 8).map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  regionFilter === r
                    ? "bg-[#C9973A] text-[#0A1017] font-semibold"
                    : "bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#FAFAFA]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ROUTES TAB */}
        {tab === "routes" && (
          <div className="p-3 flex-1">
            <p className="text-[11px] text-[#888888] uppercase tracking-wider mb-2 font-medium">
              🏕 МАРШРУТЫ ({filteredRoutes.length})
            </p>
            <div className="space-y-1 mb-5 max-h-[40vh] overflow-y-auto scrollbar-thin pr-1">
              {filteredRoutes.map((route) => (
                <button
                  key={route.routeId}
                  onClick={() => handleRouteClick(route)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all ${
                    activeRoute === route.routeId
                      ? "bg-[#C9973A]/15 border border-[#C9973A]/40 text-[#C9973A]"
                      : "text-[#FAFAFA]/70 hover:bg-white/5 border border-transparent hover:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{typeEmojis[route.type] || "🗺"}</span>
                    <span className="truncate font-medium">{route.name}</span>
                  </div>
                  <div className="text-[10px] text-[#888888] mt-0.5 ml-6">
                    {route.region} · {route.durationDays} дн · {(route.budgetPerDay * route.durationDays).toLocaleString()} сом
                  </div>
                </button>
              ))}
              {filteredRoutes.length === 0 && (
                <p className="text-xs text-[#555] text-center py-6">Маршруты не найдены</p>
              )}
            </div>

            <p className="text-[11px] text-[#888888] uppercase tracking-wider mb-2 font-medium">🏠 ЖИЛЬЁ ({guesthouses?.length || 0})</p>
            <div className="space-y-1 max-h-[20vh] overflow-y-auto scrollbar-thin pr-1">
              {guesthouses?.map((gh) => (
                <button
                  key={gh.ghId}
                  onClick={() => gh.lat && gh.lng && setFlyTo([gh.lat, gh.lng], 13)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#FAFAFA]/60 hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors"
                >
                  <span className="truncate">{gh.name}</span>
                  <span className="text-[10px] text-[#888888] ml-2">
                    {(gh.pricePerNight || 0).toLocaleString()} с/н
                  </span>
                  {(gh.kgstdStars ?? 0) > 0 && (
                    <span className="text-[#C9973A] ml-1">{'⭐'.repeat(gh.kgstdStars ?? 0)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BUILD TAB */}
        {tab === "build" && (
          <div className="p-3 flex-1 flex flex-col">
            <div className="mb-3">
              <p className="text-sm text-[#FAFAFA] font-medium mb-1">Составьте свой маршрут</p>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Нажмите на точку на карте или выберите из списка → получите расчёт стоимости и дней
              </p>
            </div>

            {/* Objects to add */}
            <div className="mb-3">
              <p className="text-[11px] text-[#888888] uppercase tracking-wider mb-2 font-medium">
                📍 ДОБАВИТЬ ТОЧКУ ({filteredObjects.filter(o => !buildStops.find(s => s.id === (o.objectId || String(o.id)))).length})
              </p>
              <div className="space-y-1 max-h-[28vh] overflow-y-auto scrollbar-thin pr-1">
                {filteredObjects
                  .filter(o => !buildStops.find(s => s.id === (o.objectId || String(o.id))))
                  .slice(0, 40)
                  .map((obj) => (
                    <button
                      key={obj.objectId || obj.id}
                      onClick={() => addStop(obj)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#FAFAFA]/70 hover:bg-[#D4F87A]/10 hover:text-[#D4F87A] border border-transparent hover:border-[#D4F87A]/20 transition-all flex items-center gap-2"
                    >
                      <span className="flex-1 truncate">{obj.name}</span>
                      <span className="text-[9px] text-[#888888] flex-shrink-0">{obj.region}</span>
                      {obj.price > 0 && (
                        <span className="text-[9px] text-[#C9973A] flex-shrink-0">{obj.price.toLocaleString()}с</span>
                      )}
                      <span className="text-[#D4F87A] font-bold flex-shrink-0">+</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* My stops */}
            {myRoute.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-[#888888] uppercase tracking-wider font-medium">
                    МОЙ МАРШРУТ ({myRoute.length})
                  </p>
                  <div className="flex gap-2">
                    {buildStops.length >= 3 && (
                      <button
                        onClick={handleOptimize}
                        title="Расставить точки в оптимальном порядке"
                        className="text-[10px] text-[#C9973A] hover:text-[#D4A84A] transition-colors"
                      >
                        ⚡ Оптимизировать
                      </button>
                    )}
                    <button onClick={() => clearStore()} className="text-[10px] text-[#888888] hover:text-red-400 transition-colors">
                      Очистить
                    </button>
                  </div>
                </div>
                <div className="space-y-0">
                  {myRoute.map((stop, i) => (
                    <div key={stop.id}>
                      <div className="flex items-center gap-1.5 px-2 py-2 bg-[#D4F87A]/5 border border-[#D4F87A]/15 rounded-lg">
                        <div className="w-5 h-5 rounded-full bg-[#2D5A3D] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-xs text-[#D4F87A] truncate flex-1">{stop.name}</span>
                        <span className="text-[9px] text-[#888888] flex-shrink-0 hidden sm:block">{stop.region}</span>
                        <div className="flex gap-0.5 flex-shrink-0">
                          <button onClick={() => moveStop(i, -1)} disabled={i === 0} className="text-[#888888] hover:text-white text-sm w-4 disabled:opacity-20">↑</button>
                          <button onClick={() => moveStop(i, 1)} disabled={i === myRoute.length - 1} className="text-[#888888] hover:text-white text-sm w-4 disabled:opacity-20">↓</button>
                          <button onClick={() => removeStop(stop.id)} className="text-[#888888] hover:text-red-400 text-sm w-4">×</button>
                        </div>
                      </div>
                      {/* Segment: distance to next stop */}
                      {myRoute.length === buildStops.length && i < buildStops.length - 1 && segments[i] && (
                        <div className="flex items-center gap-2 pl-4 py-1">
                          <div className="w-px h-3 bg-[#D4F87A]/30" />
                          <span className="text-[9px] text-[#888888]">
                            🚗 {Math.round(segments[i].km)} км · {formatHours(segments[i].hours)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Route totals */}
                {buildStops.length >= 2 && (
                  <div className="mt-2 px-3 py-2 bg-[#1A3A5C]/20 border border-[#1A3A5C]/40 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-[#888888]">Весь путь</span>
                    <span className="text-xs text-[#FAFAFA] font-medium">
                      {Math.round(totalKm)} км · 🚗 {formatHours(totalHours)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Geo-based suggestions */}
            {suggestions.length > 0 && buildStops.length > 0 && (
              <div className="mb-3 p-3 bg-[#C9973A]/8 border border-[#C9973A]/20 rounded-xl">
                <p className="text-[11px] text-[#C9973A] uppercase tracking-wider font-medium mb-2">
                  💡 Рядом с маршрутом
                </p>
                <div className="space-y-1">
                  {suggestions.map((s: any) => (
                    <button
                      key={s.objectId || s.id}
                      onClick={() => addStop(s)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-lg border border-[#C9973A]/20 hover:bg-[#C9973A]/15 transition-colors"
                    >
                      <span className="text-[11px] text-[#C9973A]/90 truncate flex-1">{s.name}</span>
                      <span className="text-[9px] text-[#888888] flex-shrink-0">
                        ~{Math.round(s.distKm)} км
                      </span>
                      <span className="text-[#C9973A] text-xs font-bold flex-shrink-0">+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cost estimate */}
            {buildStops.length > 0 && (
              <div className="mt-auto p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                <p className="text-[11px] text-[#C9973A] uppercase tracking-wider font-semibold mb-3">
                  💰 Расчёт стоимости
                </p>

                {/* Pax selector */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-[#888888]">Количество человек</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPax(Math.max(1, pax - 1))} className="w-6 h-6 rounded-full border border-white/15 text-[#FAFAFA] text-xs hover:bg-white/10">−</button>
                    <span className="text-sm text-[#FAFAFA] w-4 text-center">{pax}</span>
                    <button onClick={() => setPax(Math.min(20, pax + 1))} className="w-6 h-6 rounded-full border border-white/15 text-[#FAFAFA] text-xs hover:bg-white/10">+</button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#888888]">
                    <span>📍 Регионов</span>
                    <span className="text-[#FAFAFA]">{stopRegions.length}</span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>⏱ Примерно дней</span>
                    <span className="text-[#FAFAFA] font-medium">{estDaysRounded}</span>
                  </div>
                  {buildStops.length >= 2 && (
                    <div className="flex justify-between text-[#888888]">
                      <span>🚗 Дорога</span>
                      <span className="text-[#FAFAFA]">{Math.round(totalKm)} км · {formatHours(totalHours)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5 my-1" />
                  <div className="flex justify-between text-[#888888]">
                    <span>🏠 Жильё ({pax} чел × {estDaysRounded} дн)</span>
                    <span className="text-[#FAFAFA]">{Math.round(accommodationCost).toLocaleString()} с</span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>🍽 Питание</span>
                    <span className="text-[#FAFAFA]">{Math.round(foodCost).toLocaleString()} с</span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>🚗 Транспорт</span>
                    <span className="text-[#FAFAFA]">{transportCost.toLocaleString()} с</span>
                  </div>
                  <div className="flex justify-between text-[#888888]">
                    <span>🎟 Входные билеты</span>
                    <span className="text-[#FAFAFA]">{entryFees.toLocaleString()} с</span>
                  </div>
                  {guideCost > 0 && (
                    <div className="flex justify-between text-[#888888]">
                      <span>👤 Гид (рекомендуется)</span>
                      <span className="text-[#FAFAFA]">~{guideCost.toLocaleString()} с/д</span>
                    </div>
                  )}
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between">
                    <span className="text-[#FAFAFA] font-semibold">Итого ~</span>
                    <span className="text-[#C9973A] font-bold text-sm">{totalEstimate.toLocaleString()} с</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#888888]">
                    <span>На человека</span>
                    <span>{Math.round(totalEstimate / pax).toLocaleString()} с · ~${Math.round(totalEstimate / pax / 90)}</span>
                  </div>
                </div>

                {/* Compare with guided tours */}
                {routes && stopRegions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] text-[#888888] mb-2 uppercase tracking-wider">Похожие готовые туры</p>
                    {routes.filter(r =>
                      stopRegions.some(reg => r.region.includes(reg)) &&
                      Math.abs(r.durationDays - estDaysRounded) <= 3
                    ).slice(0, 2).map(r => (
                      <div key={r.routeId} className="flex items-center justify-between py-1.5 text-[10px]">
                        <span className="text-[#FAFAFA]/60 truncate mr-2">{typeEmojis[r.type]} {r.name}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[#C9973A] font-medium">{(r.budgetPerDay * r.durationDays).toLocaleString()} с</span>
                          <span className="px-1.5 py-0.5 bg-[#2D5A3D]/30 text-[#2D5A3D] rounded text-[9px]">с гидом</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={shareWhatsApp}
                    className="py-2 bg-[#25D366] text-white text-xs font-semibold rounded-lg hover:bg-[#1FB855] transition-colors"
                  >
                    📲 В WhatsApp
                  </button>
                  <button
                    onClick={copyRoute}
                    className="py-2 border border-white/15 text-[#FAFAFA] text-xs rounded-lg hover:bg-white/5 transition-colors"
                  >
                    📋 Копировать
                  </button>
                </div>
                <Link
                  to="/builder"
                  className="mt-2 w-full text-center block py-2 bg-[#D4F87A] text-[#0A1017] text-xs font-semibold rounded-lg hover:bg-[#C4E86A] transition-colors"
                >
                  Открыть конструктор →
                </Link>
              </div>
            )}

            {buildStops.length === 0 && (
              <div className="mt-auto py-8 text-center">
                <div className="text-4xl mb-3 opacity-20">🗺</div>
                <p className="text-xs text-[#888888] mb-1">Нажмите «+» рядом с объектом</p>
                <p className="text-[10px] text-[#555]">или кликните на точку на карте</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="relative bg-[#0A1017]">
        {MapView && routes && guesthouses ? (
          <MapView
            routes={routes}
            guesthouses={guesthouses}
            objects={objects || []}
            buildStops={buildStops}
            onObjectClick={addStop}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-[#C9973A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#888888]">Загрузка карты...</p>
            </div>
          </div>
        )}

        {/* Active route card */}
        {tab === "routes" && activeRouteData && (
          <div className="absolute bottom-4 right-4 z-[800] max-w-[290px] glass-strong rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#C9973A] text-[#0A1017] text-[10px] font-bold rounded uppercase tracking-wider">
                Выбранный маршрут
              </span>
            </div>
            <h3 className="font-serif text-lg text-[#FAFAFA] mb-1 leading-tight">{activeRouteData.name}</h3>
            <p className="text-xs text-[#888888] mb-1">{activeRouteData.region} · {activeRouteData.type}</p>
            <p className="text-xs text-[#888888] mb-3">
              {activeRouteData.durationDays} дней · от {(activeRouteData.budgetPerDay * activeRouteData.durationDays).toLocaleString()} сом
              · сложность {activeRouteData.difficulty}/10
            </p>
            {activeRouteData.description && (
              <p className="text-[11px] text-[#FAFAFA]/50 leading-relaxed mb-3 border-l-2 border-[#C9973A]/40 pl-2">
                {String(activeRouteData.description).slice(0, 130)}{activeRouteData.description?.length > 130 ? "…" : ""}
              </p>
            )}
            <div className="flex gap-2">
              <Link
                to="/routes"
                className="flex-1 text-center py-2 bg-[#C9973A] text-[#0A1017] text-xs font-semibold rounded-lg hover:bg-[#D4A84A] transition-colors"
              >
                Подробнее
              </Link>
              <button
                onClick={() => setActiveRoute(null)}
                className="px-3 py-2 border border-white/10 text-[#FAFAFA] text-xs rounded-lg hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Build mode summary card */}
        {tab === "build" && buildStops.length > 0 && (
          <div className="absolute bottom-4 right-4 z-[800] max-w-[270px] glass-strong rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#D4F87A] text-[#0A1017] text-[10px] font-bold rounded">
                ВАШ МАРШРУТ
              </span>
            </div>
            <p className="text-xs text-[#FAFAFA] mb-1">{buildStops.length} точек · {stopRegions.join(" → ")}</p>
            <p className="text-xs text-[#888888] mb-1">~{estDaysRounded} дней · {pax} чел.</p>
            {buildStops.length >= 2 && (
              <p className="text-xs text-[#888888] mb-2">🚗 {Math.round(totalKm)} км · {formatHours(totalHours)} в пути</p>
            )}
            <p className="text-base font-bold text-[#C9973A]">~{totalEstimate.toLocaleString()} сом</p>
            <p className="text-[10px] text-[#888888]">
              {Math.round(totalEstimate / pax).toLocaleString()} с/чел · ~${Math.round(totalEstimate / pax / 90)}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[800] glass-panel rounded-lg p-3 text-[10px] space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1A3A5C]" /><span className="text-[#888888]">Маршруты</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#C9973A]" /><span className="text-[#888888]">Активный</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2D5A3D]" /><span className="text-[#888888]">Гестхаус</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#888888]" /><span className="text-[#888888]">Объекты</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#D4F87A]" /><span className="text-[#888888]">Ваш маршрут</span></div>
        </div>
      </div>
    </div>
  );
}
