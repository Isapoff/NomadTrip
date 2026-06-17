import { useRef, useState } from "react";
import { routeImage } from "@/lib/images";
import { Link } from "react-router";
import { motion, useInView } from "framer-motion";
import { trpc } from "@/providers/trpc";
import BookingModal from "../booking/BookingModal";

const typeEmojis: Record<string, string> = {
  "Треккинг":"🏔","Горнолыжный":"⛷","Водный":"🌊","Оздоровительный":"💆",
  "Историко-культурный":"🏛","Экотуризм":"🌿","Городской":"🏙","Конный":"🐴",
  "Альпинизм":"🧗","Рафтинг":"🚣","Гастрономический":"🍽","Этнокультурный":"🎭",
  "Пляжно-экскурсионный":"🏖","Автотур":"🚗","Комбинированный":"🗺","Паломнический":"🕌",
  "Спортивный":"🏋","Бюджетный":"💰",
};

// Gradient backgrounds by route type when image not available
const typeBg: Record<string, string> = {
  "Треккинг": "linear-gradient(135deg, #1A3A5C 0%, #0a2040 100%)",
  "Альпинизм": "linear-gradient(135deg, #1A2C3C 0%, #0a1520 100%)",
  "Экотуризм": "linear-gradient(135deg, #1A3A2C 0%, #0a2015 100%)",
  "Этнокультурный": "linear-gradient(135deg, #3A2A1A 0%, #201510 100%)",
  "Историко-культурный": "linear-gradient(135deg, #3A2020 0%, #201010 100%)",
  "Оздоровительный": "linear-gradient(135deg, #1A2A4A 0%, #0a1530 100%)",
  "default": "linear-gradient(135deg, #1A1A2A 0%, #0a0a15 100%)",
};

// Real Unsplash image mapping by route character
const fallbackRoutes = [
  { routeId: "R02", name: "Adventure Иссык-Куль", region: "Иссык-Куль", durationDays: 5, budgetPerDay: 6000, difficulty: 6, rating: 4.8, type: "Треккинг", featured: 1, description: "Треккинг вокруг Иссык-Куля, Джети-Огуз, Семёновское ущелье" },
  { routeId: "R17", name: "Сон-Куль + Кочевники", region: "Нарын", durationDays: 4, budgetPerDay: 6000, difficulty: 2, rating: 4.8, type: "Этнокультурный", featured: 0, description: "Жизнь в юрте, кумыс, конные прогулки на высокогорном озере" },
  { routeId: "R06", name: "Горное озеро Ала-Куль", region: "Иссык-Куль", durationDays: 4, budgetPerDay: 7000, difficulty: 8, rating: 4.9, type: "Альпинизм", featured: 0, description: "Подъём к ледниковому озеру через перевал Ала-Куль (3860м)" },
  { routeId: "R04", name: "Культура Оша", region: "Ош", durationDays: 4, budgetPerDay: 3500, difficulty: 3, rating: 4.5, type: "Историко-культурный", featured: 0, description: "Сулайман-Тоо — ЮНЕСКО, Ошский базар, Узгенский комплекс XI века" },
  { routeId: "R05", name: "Арсланбоб и леса", region: "Жалал-Абад", durationDays: 5, budgetPerDay: 4000, difficulty: 4, rating: 4.7, type: "Экотуризм", featured: 0, description: "Крупнейший ореховый лес в мире, 80-метровый водопад" },
  { routeId: "R27", name: "Таш-Рабат — Шёлковый путь", region: "Нарын", durationDays: 3, budgetPerDay: 4500, difficulty: 3, rating: 4.6, type: "Историко-культурный", featured: 0, description: "Каравансарай XV века на Великом Шёлковом пути" },
];

export default function RouteCarousel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [bookingRoute, setBookingRoute] = useState<any>(null);
  const { data: routes } = trpc.routes.list.useQuery({});

  const displayRoutes = routes && routes.length > 0
    ? routes.filter((r: any) => r.featured || ["R02","R17","R06","R04","R05","R27","R11","R29","R44"].includes(r.routeId)).slice(0, 8)
    : fallbackRoutes;

  return (
    <section className="bg-[#090F16] py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <div className="flex items-center gap-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[#C9973A] text-[10px] uppercase tracking-[0.25em] mb-2 font-medium">Каталог</div>
            <h2 className="font-display text-[#FAFAFA] text-5xl md:text-6xl tracking-wider">МАРШРУТЫ</h2>
          </motion.div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>

      <motion.div
        className="flex gap-5 overflow-x-auto pb-6 px-6 lg:px-12 scrollbar-thin snap-x snap-mandatory cursor-grab active:cursor-grabbing"
        initial={{ opacity: 0, x: 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.3 }}
      >
        {displayRoutes.map((route: any) => (
          <motion.div
            key={route.routeId}
            className={`flex-shrink-0 snap-center group cursor-pointer ${
              route.featured ? "w-[380px] md:w-[440px]" : "w-[300px] md:w-[360px]"
            }`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`keep-dark relative overflow-hidden rounded-2xl ${route.featured ? "ring-2 ring-[#C9973A]/60" : "ring-1 ring-white/10"}`}>
              {/* Image */}
              <div className={`overflow-hidden ${route.featured ? "aspect-[16/10]" : "aspect-[16/11]"}`}>
                <img
                  src={routeImage(route)}
                  alt={route.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ filter: "brightness(0.7) contrast(1.05) saturate(0.9)" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).parentElement!.style.background = typeBg[route.type] || typeBg.default;
                  }}
                />
                {/* Type emoji fallback overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0 pointer-events-none">
                  <span style={{ fontSize: 60, opacity: 0.15 }}>{typeEmojis[route.type] || "🗺"}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {route.featured && (
                  <span className="inline-block px-2.5 py-0.5 bg-[#D4F87A] text-[#0A1017] text-[9px] uppercase tracking-wider font-bold rounded mb-2.5">
                    ⭐ Топ выбор
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#D4F87A] text-[9px] uppercase tracking-[0.18em] font-medium">
                    {route.region}
                  </span>
                  <span className="text-[#888888] text-[9px]">·</span>
                  <span className="text-[#888888] text-[9px]">{typeEmojis[route.type]} {route.type}</span>
                </div>
                <h3 className="font-serif text-xl text-[#FAFAFA] mb-1.5 leading-tight group-hover:text-[#F5E8D3] transition-colors">
                  {route.name}
                </h3>
                {route.description && (
                  <p className="text-xs text-[#888888] mb-3 leading-relaxed line-clamp-2">
                    {route.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#888888]">
                      ⏱ {route.durationDays} дней · 💰 {(route.budgetPerDay * route.durationDays).toLocaleString()} сом
                    </div>
                    <div className="text-[10px] text-[#888888] mt-0.5">
                      🧗 {route.difficulty}/10 · ⭐ {route.rating}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setBookingRoute(route); }}
                    className="px-4 py-1.5 border border-white/20 rounded-full text-[10px] uppercase tracking-wider text-[#FAFAFA]/70 hover:bg-white/10 hover:border-white/40 hover:text-[#FAFAFA] transition-all"
                  >
                    Смотреть
                  </button>
                </div>
              </div>

              {/* Difficulty badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-[#FAFAFA] text-[9px] rounded-full font-medium">
                  {route.difficulty}/10
                </span>
                {route.rating >= 4.7 && (
                  <span className="px-2 py-0.5 bg-[#C9973A]/80 backdrop-blur-sm text-white text-[9px] rounded-full font-medium">
                    ⭐ {route.rating}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* "View all" card */}
        <div className="flex-shrink-0 w-[200px] snap-center flex items-center justify-center">
          <Link
            to="/routes"
            className="flex flex-col items-center gap-3 text-[#888888] hover:text-[#C9973A] transition-colors group"
          >
            <div className="w-14 h-14 border border-white/15 rounded-full flex items-center justify-center group-hover:border-[#C9973A]/40 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium">Все маршруты</div>
              <div className="text-[10px] text-[#888888]">{routes?.length || 47} туров</div>
            </div>
          </Link>
        </div>
      </motion.div>

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
    </section>
  );
}
