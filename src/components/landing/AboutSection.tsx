import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const regions = [
  {
    name: "Иссык-Куль",
    days: "Дни 1–3",
    description: "Второе по объёму горное озеро в мире. Пляжи Чолпон-Аты, ущелья Джети-Огуз и Григорьевка, Семёновка, треккинг к озеру Ала-Куль (3860м). Курортный Каракол — база для восхождений.",
    routes: "14 маршрутов",
    image: "/issyk-kul.jpg",
    img2: "/jeti-oguz.jpg",
    color: "#1A6B8A",
  },
  {
    name: "Нарын + Сон-Куль",
    days: "Дни 4–6",
    description: "Высокогорное озеро Сон-Куль (3016м) — жемчужина кочевников. Юрты, кумыс, конные прогулки под звёздным небом. Каравансарай Таш-Рабат на Шёлковом пути. Труднодоступное Кёль-Суу.",
    routes: "9 маршрутов",
    image: "/yurt-family.jpg",
    img2: "/tash-rabat.jpg",
    color: "#2D5A3D",
  },
  {
    name: "Ош + Жалал-Абад",
    days: "Дни 7–10",
    description: "Сулайман-Тоо — объект ЮНЕСКО, священная гора в сердце города. Арсланбоб — крупнейший ореховый лес в мире с 80-метровым водопадом. Узгенский комплекс XI века. Алайская долина и базовый лагерь Пика Ленина (7134м).",
    routes: "12 маршрутов",
    image: "/tash-rabat.jpg",
    img2: "/yurt-interior.jpg",
    color: "#8B4A2A",
  },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-[#0A1017] py-24 lg:py-36" ref={ref}>
      {/* Section title */}
      <div className="w-full px-6 lg:px-12 mb-20">
        <div className="flex items-center justify-center gap-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/15" />
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="text-[#C9973A] text-[10px] uppercase tracking-[0.25em] mb-3 font-medium">
              О ПЛАТФОРМЕ
            </div>
            <h2 className="font-display text-[#FAFAFA] text-5xl md:text-7xl tracking-wider">
              О ПЛАТФОРМЕ
            </h2>
          </motion.div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/15" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Left: Editorial copy */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <p className="font-serif text-xl md:text-2xl text-[#FAFAFA]/85 leading-[1.75]">
              Мы разработали систему персональных рекомендаций для путешествий по
              Кыргызстану. Алгоритм WSM анализирует ваши предпочтения и подбирает
              маршрут из{" "}
              <span className="text-[#D4F87A]">47 туров по семи регионам</span>{" "}
              страны — от бюджетного до премиального.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="font-serif text-xl md:text-2xl text-[#FAFAFA]/85 leading-[1.75]">
              Никаких забот о маршрутах, расписаниях или поиске жилья — всё уже
              организовано. Просто ответьте на 6 вопросов, и система найдёт ваш{" "}
              <span className="text-[#D4F87A]">идеальный тур</span>.
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            {[
              { n: "47", l: "маршрутов в базе", c: "#C9973A" },
              { n: "100", l: "туристических объектов", c: "#1E7A45" },
              { n: "17", l: "мест размещения", c: "#C9973A" },
              { n: "KGSTD", l: "стандарт устойчивости", c: "#1E7A45" },
            ].map((s) => (
              <div key={s.l} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5">
                <div className="font-display text-3xl mb-1" style={{ color: s.c }}>{s.n}</div>
                <div className="text-xs text-[#888888] tracking-wide">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Timeline */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-[#C9973A]/40 via-[#D4F87A]/20 to-transparent" />

          {regions.map((region, i) => (
            <motion.div
              key={region.name}
              className="relative mb-14 last:mb-0 group"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.2 }}
            >
              {/* Timeline node */}
              <div
                className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full ring-2 ring-[#0A1017]"
                style={{ background: region.color }}
              />

              <div className="ml-7">
                <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: region.color }}>
                  {region.days}
                </div>
                <h3 className="font-display text-2xl text-[#FAFAFA] mb-2 tracking-wide">
                  {region.name}
                </h3>
                <p className="text-sm text-[#888888] leading-relaxed mb-4 max-w-[320px]">
                  {region.description}
                </p>
                <div className="text-[10px] text-[#D4F87A]/70 uppercase tracking-[0.15em] mb-4">
                  {region.routes}
                </div>

                {/* Photo cluster */}
                <div className="relative w-[260px] group-hover:w-[280px] transition-all duration-500">
                  {/* Back photo */}
                  <div
                    className="absolute top-2 left-3 w-full h-[140px] overflow-hidden rounded-lg border border-white/10 shadow-lg transition-all duration-500 group-hover:top-0 group-hover:left-5 group-hover:rotate-3"
                    style={{ transform: `rotate(${(i % 2 === 0 ? 3 : -3)}deg)`, filter: "brightness(0.6)" }}
                  >
                    <img src={region.img2} alt="" className="w-full h-full object-cover" />
                  </div>
                  {/* Front photo */}
                  <div
                    className="relative overflow-hidden rounded-lg border border-white/10 shadow-xl transition-all duration-500 group-hover:-rotate-1"
                    style={{ transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)` }}
                  >
                    <img
                      src={region.image}
                      alt={region.name}
                      className="w-full h-[155px] object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-xs text-white/70 font-medium">{region.name}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
