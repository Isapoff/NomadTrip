import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Анкета",
    body: "Ответьте на 6 вопросов о бюджете, сезоне и интересах",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Алгоритм WSM",
    body: "Взвешенная сумма оценивает 47 маршрутов по 5 критериям",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 6l4-4 4 4M12 2v14M4 18l-2 2 2 2M20 18l2 2-2 2M6 20h12" />
      </svg>
    ),
    title: "Топ-5 маршрутов",
    body: "Персональный рейтинг с объяснением каждого балла",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Конструктор",
    body: "Соберите свой маршрут: жильё, транспорт, достопримечательности",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-[#0A1017] py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-16">
          <motion.h2
            className="font-display text-[#FAFAFA] text-4xl md:text-5xl lg:text-6xl tracking-wider"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            КАК ЭТО РАБОТАЕТ
          </motion.h2>
          <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="group glass-panel rounded-xl p-6 lg:p-8 cursor-default transition-all duration-300 hover:-translate-y-1 hover:border-[#D4F87A]/30"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
            >
              <div className="text-[#D4F87A] mb-4 group-hover:scale-110 transition-transform duration-300 origin-top-left">
                {step.icon}
              </div>
              <h3 className="tracked-small text-[#FAFAFA] mb-3">{step.title}</h3>
              <p className="text-sm text-[#888888] leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
