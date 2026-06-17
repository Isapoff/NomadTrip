import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "framer-motion";

export default function KgstdSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const aspects = [
    { name: "Социальный", color: "#1A3A5C", pct: 85 },
    { name: "Экономический", color: "#C9973A", pct: 72 },
    { name: "Экологический", color: "#2D5A3D", pct: 68 },
  ];

  return (
    <section className="bg-[#0A1017] py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Photo */}
        <motion.div
          className="relative overflow-hidden rounded-xl"
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/yurt-family.jpg"
            alt="Yurt family"
            className="w-full h-full object-cover min-h-[400px] lg:min-h-[500px]"
            style={{ filter: "brightness(0.85) contrast(1.05)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A1017]/30" />
        </motion.div>

        {/* Right: Content */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-display text-[#FAFAFA] text-4xl md:text-5xl tracking-wider mb-2">
              KGSTD <span className="text-[#D4F87A]">2025</span>
            </h2>
            <p className="text-sm text-[#888888] mb-8 uppercase tracking-wider">
              Kyrgyzstan Green Sustainable Tourism Destination
            </p>
          </motion.div>

          {/* Bars */}
          <div className="space-y-6 mb-8">
            {aspects.map((aspect, i) => (
              <motion.div
                key={aspect.name}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#FAFAFA]">{aspect.name}</span>
                  <span className="text-sm" style={{ color: aspect.color }}>
                    {aspect.pct}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: aspect.color }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${aspect.pct}%` } : {}}
                    transition={{ duration: 1.2, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-[#888888] text-sm leading-relaxed mb-6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Стандарт устойчивого развития туризма Кыргызстана — 27 критериев
            оценки по трём аспектам: социальному, экономическому и экологическому.
            Проверка и аудит проводятся организацией КАТО.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Link
              to="/guesthouses"
              className="inline-flex items-center gap-2 text-[#C9973A] hover:text-[#D4F87A] transition-colors tracked-small"
            >
              Сертифицированное жильё
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
