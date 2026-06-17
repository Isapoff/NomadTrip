import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import ProviderLogin from "@/components/provider/ProviderLogin";
import AdminRoutes from "@/components/provider/AdminRoutes";
import AdminGuesthouses from "@/components/provider/AdminGuesthouses";
import AdminObjects from "@/components/provider/AdminObjects";
import ProviderBookings from "@/components/provider/ProviderBookings";
import { LogOut, Loader2 } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Дашборд" },
  { id: "requests", label: "Заявки" },
  { id: "tours", label: "Мои туры" },
  { id: "analytics", label: "Аналитика" },
  { id: "admin_routes", label: "✎ Маршруты" },
  { id: "admin_guesthouses", label: "✎ Жильё" },
  { id: "admin_objects", label: "✎ Объекты" },
];

function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-[#888888] w-[100px] truncate text-right flex-shrink-0">{item.label}</span>
          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color || "#2D5A3D", minWidth: item.value > 0 ? "30px" : "0" }}
            >
              {item.value > 0 && (
                <span className="text-[10px] text-white font-medium">{item.value}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProviderPage() {
  const { provider, isLoading, isAuthenticated, logout } = useProviderAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  trpc.analytics.dashboard.useQuery(undefined, { enabled: isAuthenticated });
  const recentBookings = trpc.booking.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Loading session check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1017] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#2D5A3D]" />
      </div>
    );
  }

  // Not logged in → show login screen
  if (!isAuthenticated) {
    return <ProviderLogin />;
  }

  const statusMeta: Record<string, { label: string; color: string }> = {
    new: { label: "Новая", color: "#C9973A" },
    progress: { label: "В работе", color: "#1A6B8A" },
    confirmed: { label: "Подтверждена", color: "#1E7A45" },
    closed: { label: "Закрыта", color: "#888888" },
    cancelled: { label: "Отменена", color: "#B14B4B" },
  };
  const requests = (recentBookings.data ?? []).slice(0, 3).map((b) => ({
    id: b.bookingId,
    status: b.status,
    statusLabel: (statusMeta[b.status] ?? statusMeta.new).label,
    statusColor: (statusMeta[b.status] ?? statusMeta.new).color,
    name: b.name,
    pax: `${b.pax} чел.`,
    budget: b.total != null ? `${b.total.toLocaleString("ru")} сом` : "—",
    dates: b.date || "—",
    profile: b.routeName || b.routeId,
    phone: b.phone,
  }));

  const tours = [
    { id: "R02", name: "Adventure Иссык-Куль", type: "Треккинг", date: "15 июля", price: "45 000 с", spots: "6/12" },
    { id: "R01", name: "Классический KG", type: "Культурный", date: "22 июля", price: "32 000 с", spots: "8/14" },
    { id: "R17", name: "Сон-Куль + Кочевники", type: "Юрты", date: "3 авг.", price: "28 000 с", spots: "4/8" },
  ];

  const statusBadge = (color: string, label: string) => (
    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: `${color}20`, color }}>
      {label}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0A1017]">
      {/* Green nav bar */}
      <div className="bg-[#2D5A3D] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3.5 text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white/[0.15] text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-white font-medium leading-tight">{provider?.name}</p>
                <p className="text-[10px] text-white/50 leading-tight">
                  {provider?.company || provider?.login}
                </p>
              </div>
              <button
                onClick={() => logout()}
                title="Выйти"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { value: "47", label: "Заявок сегодня", color: "#2D5A3D" },
                { value: "312", label: "За месяц", color: "#2D5A3D" },
                { value: "25%", label: "Конверсия", color: "#C9973A" },
                { value: "8", label: "Активных туров", color: "#1A3A5C" },
                { value: "4.8", label: "Рейтинг", color: "#C9973A" },
                { value: "1.2M", label: "Выручка, сом", color: "#2D5A3D" },
              ].map((kpi) => (
                <div key={kpi.label} className="glass-panel rounded-xl p-4 text-center">
                  <p className="font-display text-2xl" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-[10px] text-[#888888] mt-1 uppercase tracking-wider">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Two column cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incoming requests */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="tracked-small text-[#FAFAFA] mb-4">Входящие заявки</h3>
                <div className="space-y-3">
                  {requests.slice(0, 3).map((req) => (
                    <div key={req.id} className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#888888]">#{req.id}</span>
                        {statusBadge(req.statusColor, req.statusLabel)}
                      </div>
                      <p className="text-sm text-[#FAFAFA] font-medium">{req.name}</p>
                      <p className="text-[10px] text-[#888888]">{req.pax} · {req.budget}</p>
                      <p className="text-[10px] text-[#888888]">{req.dates}</p>
                      <p className="text-[10px] text-[#C9973A] mt-1">{req.profile}</p>
                      <div className="flex gap-2 mt-2">
                        {req.status === "new" && (
                          <button
                            onClick={() => setActiveTab("requests")}
                            className="px-3 py-1 bg-[#2D5A3D] text-white text-[10px] rounded"
                          >
                            Открыть заявку
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route popularity */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="tracked-small text-[#FAFAFA] mb-4">Популярность маршрутов</h3>
                <BarChart
                  data={[
                    { label: "R02 Adventure", value: 47, color: "#2D5A3D" },
                    { label: "R01 Классический", value: 38, color: "#2D5A3D" },
                    { label: "R13 Сон-Куль", value: 28, color: "#2D5A3D" },
                    { label: "R15 Озёра Нарын", value: 22, color: "#2D5A3D" },
                  ]}
                />
                <div className="border-t border-white/5 mt-4 pt-4">
                  <h4 className="tracked-small text-[#888888] mb-3">Профили туристов</h4>
                  <BarChart
                    data={[
                      { label: "Adventure", value: 34, color: "#1A3A5C" },
                      { label: "Экотурист", value: 26, color: "#2D5A3D" },
                      { label: "Культурный", value: 21, color: "#8B2020" },
                      { label: "Семейный", value: 13, color: "#C9973A" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {activeTab === "requests" && <ProviderBookings />}

        {/* TOURS */}
        {activeTab === "tours" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-[#FAFAFA]">Мои туры</h2>
              <button className="px-4 py-2 bg-[#C9973A] text-[#0A1017] text-xs font-medium rounded-lg hover:bg-[#D4A84A] transition-colors">
                + Добавить тур
              </button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.7fr] gap-4 p-4 border-b border-white/5 text-[10px] uppercase tracking-wider text-[#888888]">
                <span>Маршрут</span>
                <span>Тип</span>
                <span>Дата</span>
                <span>Цена</span>
                <span>Мест</span>
                <span></span>
              </div>
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_0.7fr] gap-4 p-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <span className="text-xs text-[#888888]">{tour.id}</span>
                    <span className="text-sm text-[#FAFAFA] ml-2">{tour.name}</span>
                  </div>
                  <span className="text-xs text-[#FAFAFA]">{tour.type}</span>
                  <span className="text-xs text-[#FAFAFA]">{tour.date}</span>
                  <span className="text-xs text-[#C9973A]">{tour.price}</span>
                  <span className="px-2 py-0.5 bg-[#2D5A3D]/15 text-[#2D5A3D] text-xs rounded-full w-fit">{tour.spots}</span>
                  <div className="flex gap-2">
                    <button className="text-[#888888] hover:text-[#FAFAFA] transition-colors">✏️</button>
                    <button className="text-[#888888] hover:text-[#FAFAFA] transition-colors">📋</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <h2 className="font-display text-2xl text-[#FAFAFA]">Аналитика</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Requests by route */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="tracked-small text-[#FAFAFA] mb-4">Заявки по маршрутам</h3>
                <BarChart
                  data={[
                    { label: "R02 Adventure", value: 47, color: "#2D5A3D" },
                    { label: "R01 Классический", value: 35, color: "#2D5A3D" },
                    { label: "R17 Сон-Куль", value: 28, color: "#2D5A3D" },
                    { label: "R23 Пик Ленина", value: 19, color: "#2D5A3D" },
                  ]}
                />
              </div>

              {/* Seasonality */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="tracked-small text-[#FAFAFA] mb-4">Сезонность</h3>
                <BarChart
                  data={[
                    { label: "Март", value: 8, color: "#888888" },
                    { label: "Апр.", value: 18, color: "#888888" },
                    { label: "Май", value: 29, color: "#C9973A" },
                    { label: "Июнь", value: 45, color: "#C9973A" },
                    { label: "Июль", value: 89, color: "#2D5A3D" },
                    { label: "Авг.", value: 76, color: "#2D5A3D" },
                    { label: "Сен.", value: 38, color: "#C9973A" },
                  ]}
                />
              </div>

              {/* Conversion by profile */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="tracked-small text-[#FAFAFA] mb-4">Конверсия по профилям</h3>
                <BarChart
                  data={[
                    { label: "Adventure", value: 32, color: "#1A3A5C" },
                    { label: "Семейный", value: 28, color: "#C9973A" },
                    { label: "Экотурист", value: 24, color: "#2D5A3D" },
                    { label: "Культурный", value: 19, color: "#8B2020" },
                  ]}
                />
              </div>

              {/* Revenue by month */}
              <div className="glass-panel rounded-xl p-5">
                <h3 className="tracked-small text-[#FAFAFA] mb-4">Выручка по месяцам (тыс. сом)</h3>
                <BarChart
                  data={[
                    { label: "Апр.", value: 180, color: "#C9973A" },
                    { label: "Май", value: 340, color: "#C9973A" },
                    { label: "Июнь", value: 560, color: "#1A3A5C" },
                    { label: "Июль", value: 890, color: "#2D5A3D" },
                    { label: "Авг.", value: 720, color: "#2D5A3D" },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
        {/* ADMIN: ROUTES */}
        {activeTab === "admin_routes" && <AdminRoutes />}

        {/* ADMIN: GUESTHOUSES */}
        {activeTab === "admin_guesthouses" && <AdminGuesthouses />}

        {/* ADMIN: OBJECTS */}
        {activeTab === "admin_objects" && <AdminObjects />}
      </div>
    </div>
  );
}
