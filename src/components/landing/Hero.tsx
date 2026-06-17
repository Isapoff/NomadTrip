import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";

const stats = [
  { num: "47", label: "Маршрутов" },
  { num: "100", label: "Объектов" },
  { num: "17", label: "Мест жилья" },
  { num: "7", label: "Регионов" },
];

const polaroids = [
  { label: "7 регионов Кыргызстана", image: "/issyk-kul.jpg", sub: "от Иссык-Куля до Баткена" },
  { label: "47 маршрутов", image: "/tash-rabat.jpg", sub: "треккинг, культура, отдых" },
  { label: "17 мест жилья", image: "/yurt-interior.jpg", sub: "юрты, гестхаусы, homestay" },
  { label: "WSM-алгоритм", image: "/jeti-oguz.jpg", sub: "персональный подбор тура" },
  { label: "от 5 000 сом/день", image: "/milky-way-yurt.jpg", sub: "для любого бюджета" },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const mountainY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const stripX = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={containerRef} className="keep-dark relative w-full h-screen overflow-hidden bg-[#0A1017]">

      {/* ── BACKGROUND: Mountains ── */}
      <motion.div className="absolute inset-0 z-[1]" style={{ y: mountainY }}>
        <img
          src="/hero-mountains.jpg"
          alt="Тянь-Шань"
          className="w-full h-[130%] object-cover"
          style={{ filter: "brightness(0.65) contrast(1.15) saturate(0.85)" }}
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1017]/30 via-transparent to-[#0A1017]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1017]/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#0A1017] to-transparent" />
      </motion.div>

      {/* ── MID: КЫРГЫЗСТАН typography behind mountains ── */}
      <motion.div
        className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        {/* Outlined giant text — sits BEHIND the mountain via z-index */}
        <div className="relative">
          <h1
            className="font-display text-transparent text-center select-none"
            style={{
              fontSize: "clamp(52px, 13vw, 192px)",
              letterSpacing: "0.06em",
              lineHeight: 0.88,
              WebkitTextStroke: "1.5px rgba(245, 232, 211, 0.25)",
              textShadow: "0 0 80px rgba(201, 151, 58, 0.08)",
            }}
          >
            КЫРГЫЗСТАН
          </h1>
          {/* Solid version faintly layered */}
          <h1
            className="absolute inset-0 font-display text-center select-none"
            style={{
              fontSize: "clamp(52px, 13vw, 192px)",
              letterSpacing: "0.06em",
              lineHeight: 0.88,
              color: "rgba(245, 232, 211, 0.04)",
            }}
          >
            КЫРГЫЗСТАН
          </h1>
        </div>
      </motion.div>

      {/* ── FOREGROUND: Horseman figure ── */}
      <motion.div
        className="absolute bottom-[18%] right-[12%] z-[4] w-[180px] md:w-[260px] lg:w-[320px]"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          src="/horseman.jpg"
          alt="Кыргызский всадник"
          className="w-full h-auto object-contain"
          style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.7))" }}
        />
      </motion.div>

      {/* ── CONTENT OVERLAY ── */}
      <motion.div
        className="absolute inset-0 z-[5] flex flex-col pointer-events-none"
        style={{ opacity: overlayOpacity }}
      >
        {/* Spacer for navbar */}
        <div className="h-16" />

        {/* Center-left: Hero copy */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 max-w-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-px bg-[#C9973A]" />
              <span className="text-[#C9973A] text-[10px] uppercase tracking-[0.25em] font-medium">
                Персональные рекомендации · Кыргызстан
              </span>
            </div>

            <h2
              className="font-serif text-[#FAFAFA] leading-[1.1] mb-4"
              style={{ fontSize: "clamp(28px, 4vw, 54px)", fontWeight: 300 }}
            >
              Найдите свой<br />
              <em style={{ color: "#C9973A" }}>идеальный</em> маршрут
            </h2>

            <p className="text-[#FAFAFA]/40 text-sm leading-relaxed mb-6 max-w-[420px]">
              Алгоритм WSM анализирует ваши предпочтения и подбирает маршрут
              из 47 туров по семи регионам Кыргызстана — от Иссык-Куля
              до Алайской долины, от юрт Сон-Куля до базаров Оша.
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mb-7 flex-wrap">
              {stats.map((s) => (
                <div key={s.label}>
                  <div
                    className="font-serif text-[#C9973A]"
                    style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 300, lineHeight: 1 }}
                  >
                    {s.num}
                  </div>
                  <div className="text-[9px] text-[#FAFAFA]/25 uppercase tracking-[0.12em] mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 flex-wrap pointer-events-auto">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#C9973A] text-[#0A1017] rounded-lg text-sm font-semibold hover:bg-[#D4A84A] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#C9973A]/25"
              >
                Подобрать маршрут
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2.5 px-6 py-3 border border-white/20 text-[#FAFAFA]/70 rounded-lg text-sm hover:border-white/40 hover:text-[#FAFAFA] transition-all duration-300 backdrop-blur-sm bg-white/5"
              >
                Карта маршрутов
              </Link>
              <Link
                to="/builder"
                className="inline-flex items-center gap-2.5 px-6 py-3 border border-[#D4F87A]/30 text-[#D4F87A]/80 rounded-lg text-sm hover:border-[#D4F87A]/60 hover:text-[#D4F87A] transition-all duration-300 backdrop-blur-sm bg-[#D4F87A]/5"
              >
                ✏️ Свой маршрут
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom: Polaroid strip */}
        <div className="pb-6 overflow-visible">
          <motion.div
            className="flex gap-4 px-6 lg:px-12 overflow-visible"
            style={{ x: stripX }}
          >
            {polaroids.map((p, i) => (
              <motion.div
                key={i}
                className="flex-shrink-0 w-[150px] md:w-[190px] bg-[#1a1a1a] border border-white/10 rounded-sm shadow-2xl pointer-events-auto cursor-pointer group"
                style={{
                  transform: `rotate(${(i % 2 === 0 ? -1.5 : 1.5) * (i === 2 ? 0.5 : 1)}deg)`,
                  padding: "8px 8px 28px 8px",
                }}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, rotate: 0, scale: 1.05, zIndex: 10 }}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-sm mb-2 bg-gray-800">
                  <img
                    src={p.image}
                    alt={p.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="px-1">
                  <p className="text-center text-[9px] text-[#C9973A] uppercase tracking-[0.15em] font-semibold leading-tight">
                    {p.label}
                  </p>
                  <p className="text-center text-[8px] text-[#888888] mt-0.5 leading-tight">
                    {p.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[6] flex flex-col items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity: titleOpacity }}
      >
        <span className="text-[9px] text-[#FAFAFA]/30 uppercase tracking-[0.2em]">Прокрутите</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-[#C9973A]/60 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.6, 0.3, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
