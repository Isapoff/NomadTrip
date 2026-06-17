import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useBuilderStore, type BuilderItem } from "@/store/builderStore";
import { useMapStore } from "@/store/mapStore";
import { trpc } from "@/providers/trpc";

const categoryColors: Record<string, string> = {
  "Жильё": "#2D5A3D",
  "Достопримечательность": "#1A3A5C",
  "Питание": "#8B6020",
  "Транспорт": "#6B4A9A",
};

const categoryEmojis: Record<string, string> = {
  "Жильё": "🏠",
  "Достопримечательность": "📍",
  "Питание": "🍽",
  "Транспорт": "🚌",
};

const REGIONS = ["Все", "Иссык-Куль", "Бишкек", "Нарын", "Ош", "Жалал-Абад", "Талас", "Баткен"];

export default function BuilderPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");
  const [activeRegion, setActiveRegion] = useState("Все");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const myRoute = useBuilderStore((s) => s.myRoute);
  const addItem = useBuilderStore((s) => s.addItem);
  const removeItem = useBuilderStore((s) => s.removeItem);
  const reorderItems = useBuilderStore((s) => s.reorderItems);
  const clearItems = useBuilderStore((s) => s.clearItems);
  const navigate = useNavigate();
  const setCustomRoute = useMapStore((s) => s.setCustomRoute);

  const { data: allObjects } = trpc.objects.list.useQuery({});

  const builderItems = useMemo(() => {
    if (!allObjects) return [];
    return allObjects.map((obj) => ({
      id: obj.objectId,
      name: obj.name,
      category: obj.category,
      region: obj.region,
      price: obj.price || 0,
      emoji: categoryEmojis[obj.category] || "📍",
      description: obj.description || undefined,
      lat: obj.lat ?? undefined,
      lng: obj.lng ?? undefined,
    }));
  }, [allObjects]);

  const filteredItems = useMemo(() => {
    return builderItems.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeCategory !== "Все" && item.category !== activeCategory) return false;
      if (activeRegion !== "Все" && item.region !== activeRegion) return false;
      return true;
    });
  }, [builderItems, search, activeCategory, activeRegion]);

  const isInRoute = (id: string) => myRoute.some((i: BuilderItem) => i.id === id);

  const costs = useMemo(() => {
    const lodging = myRoute.filter((i: BuilderItem) => i.category === "Жильё").reduce((s: number, i: BuilderItem) => s + i.price, 0);
    const attractions = myRoute.filter((i: BuilderItem) => i.category === "Достопримечательность").reduce((s: number, i: BuilderItem) => s + i.price, 0);
    const transport = myRoute.filter((i: BuilderItem) => i.category === "Транспорт").reduce((s: number, i: BuilderItem) => s + i.price, 0);
    const food = myRoute.filter((i: BuilderItem) => i.category === "Питание").reduce((s: number, i: BuilderItem) => s + i.price, 0);
    const lodgingCount = myRoute.filter((i: BuilderItem) => i.category === "Жильё").length;
    const attractionsCount = myRoute.filter((i: BuilderItem) => i.category === "Достопримечательность").length;
    const transportCount = myRoute.filter((i: BuilderItem) => i.category === "Транспорт").length;
    const foodCount = myRoute.filter((i: BuilderItem) => i.category === "Питание").length;
    const totalWithoutFood = lodging + attractions + transport;
    const estimatedDays = Math.max(1, Math.ceil((attractionsCount + foodCount) / 3));
    return { lodging, attractions, transport, food, lodgingCount, attractionsCount, transportCount, foodCount, totalWithoutFood, estimatedDays };
  }, [myRoute]);

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    reorderItems(dragIndex, index);
    setDragIndex(index);
  };

  const handleMapClick = () => {
    setCustomRoute(true);
    navigate("/map");
  };

  return (
    <div className="min-h-screen bg-[#0A1017] py-8 px-6 lg:px-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <p className="section-label mb-2">КОНСТРУКТОР МАРШРУТА</p>
        <h1 className="font-display text-3xl md:text-4xl text-[#FAFAFA] mb-2">Составьте свой маршрут</h1>
        <p className="text-sm text-[#888888]">
          Добавляйте жильё, достопримечательности, рестораны и транспорт — считаем стоимость автоматически
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* LEFT: Item picker */}
        <div>
          {/* Search & filters */}
          <div className="mb-6 space-y-4">
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-hairline w-full max-w-md py-3 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              {["Все", "🏠 Жильё", "📍 Достопримечательность", "🍽 Питание", "🚌 Транспорт"].map((cat) => {
                const catName = cat.replace(/[^\w\sА-Яа-я]/g, "").trim();
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(catName === "Все" ? "Все" : catName)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      (catName === "Все" && activeCategory === "Все") ||
                      activeCategory === catName
                        ? "bg-[#C9973A] text-[#0A1017] font-medium"
                        : "bg-white/5 text-[#888888] hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                    activeRegion === region
                      ? "bg-[#1A3A5C] text-[#FAFAFA] font-medium"
                      : "bg-white/5 text-[#888888] hover:bg-white/10"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto scrollbar-thin pr-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (isInRoute(item.id)) {
                    removeItem(item.id);
                  } else {
                    addItem(item as BuilderItem);
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                  isInRoute(item.id)
                    ? "bg-white/10 border-[#D4F87A]/30"
                    : "bg-white/[0.02] border-transparent hover:bg-white/5 hover:border-white/5"
                }`}
              >
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#FAFAFA] truncate">{item.name}</p>
                  <p className="text-[10px] text-[#888888]">
                    {item.region} · <span style={{ color: categoryColors[item.category] || "#888" }}>{item.category}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${item.price > 0 ? "text-[#1A3A5C]" : "text-[#2D5A3D]"}`}>
                    {item.price > 0 ? `${item.price.toLocaleString()} с` : "Бесплатно"}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isInRoute(item.id) ? "bg-[#D4F87A] text-[#0A1017]" : "bg-white/5 text-[#888888]"
                }`}>
                  {isInRoute(item.id) ? "✓" : "+"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Route panel */}
        <div className="lg:sticky lg:top-20 self-start">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="tracked-small text-[#FAFAFA]">МОЙ МАРШРУТ</h3>
              <span className="px-2.5 py-1 bg-[#1A3A5C]/50 text-[#C9973A] text-xs rounded-full font-medium">
                {myRoute.length} остановок
              </span>
            </div>

            {myRoute.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl mb-3 block">🗺</span>
                <p className="text-sm text-[#888888]">Добавьте объекты из списка слева</p>
                <p className="text-[10px] text-[#888888]/60 mt-1">
                  Жильё, достопримечательности, питание, транспорт
                </p>
              </div>
            ) : (
              <>
                {/* Stop list */}
                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {myRoute.map((stop: BuilderItem, index: number) => (
                    <div
                      key={stop.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={() => setDragIndex(null)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg cursor-move transition-all ${
                        dragIndex === index ? "opacity-60 border border-[#C9973A]" : "bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium text-white flex-shrink-0"
                        style={{ backgroundColor: categoryColors[stop.category] || "#888" }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm">{stop.emoji}</span>
                      <span className="text-xs text-[#FAFAFA] flex-1 truncate">{stop.name}</span>
                      <span className="text-[10px]" style={{ color: categoryColors[stop.category] }}>
                        {stop.category}
                      </span>
                      <span className="text-xs text-[#888888]">{stop.price > 0 ? `${stop.price.toLocaleString()} с` : "—"}</span>
                      <button
                        onClick={() => removeItem(stop.id)}
                        className="text-[#888888] hover:text-red-400 transition-colors text-xs ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="border-t border-white/10 pt-4 mb-4">
                  <p className="tracked-small text-[#C9973A] mb-3">СМЕТА МАРШРУТА</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">🏠 Жильё ({costs.lodgingCount} ночей)</span>
                      <span className="text-[#FAFAFA]">{costs.lodging.toLocaleString()} с</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">📍 Вход ({costs.attractionsCount} объектов)</span>
                      <span className="text-[#FAFAFA]">{costs.attractions.toLocaleString()} с</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">🚌 Транспорт ({costs.transportCount} пкт)</span>
                      <span className="text-[#FAFAFA]">{costs.transport.toLocaleString()} с</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">🍽 Питание (выбрано)</span>
                      <span className="text-[#FAFAFA]">{costs.food.toLocaleString()} с</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#888888]">⏱ Примерно дней</span>
                      <span className="text-[#FAFAFA]">~{costs.estimatedDays}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#FAFAFA]">Итого:</span>
                      <span className="text-lg font-semibold text-[#C9973A]">{costs.totalWithoutFood.toLocaleString()} сом</span>
                    </div>
                    <p className="text-[10px] text-[#888888] text-right mt-1">
                      Ориентировочно с питанием: ~{(costs.totalWithoutFood + costs.estimatedDays * 800).toLocaleString()} сом
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={handleMapClick}
                    className="flex-1 py-2.5 bg-[#C9973A] text-[#0A1017] text-sm font-medium rounded-lg hover:bg-[#D4A84A] transition-colors"
                  >
                    🗺 На карте
                  </button>
                  <button
                    onClick={clearItems}
                    className="px-4 py-2.5 border border-white/10 text-[#FAFAFA] text-sm rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
