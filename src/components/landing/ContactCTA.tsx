import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "framer-motion";

const profiles = [
  { emoji: "🌿", label: "Экотурист" },
  { emoji: "🏔", label: "Adventure" },
  { emoji: "🏛", label: "Культурный" },
];

export default function ContactCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [comment, setComment] = useState("");

  return (
    <section className="relative min-h-[80vh] flex items-center" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 z-[1]">
        <img
          src="/milky-way-yurt.jpg"
          alt="Milky Way over yurt"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.6)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1017]/70 via-transparent to-[#0A1017]/50" />
      </div>

      {/* Content */}
      <div className="relative z-[2] max-w-7xl mx-auto px-6 lg:px-10 w-full py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <motion.div
            className="glass-strong rounded-2xl p-8 lg:p-10"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-3xl text-[#FAFAFA] mb-2 italic">
              Хотите найти свой маршрут?
            </h2>
            <p className="tracked-small text-[#888888] mb-8">
              ОСТАВЬТЕ ЗАЯВКУ
            </p>

            <div className="space-y-5">
              <div>
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-hairline w-full py-3 text-sm"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Телефон"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-hairline w-full py-3 text-sm"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Регион интереса"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="input-hairline w-full py-3 text-sm"
                />
              </div>
              <div>
                <textarea
                  placeholder="Комментарий"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="input-hairline w-full py-3 text-sm resize-none"
                />
              </div>

              <button className="w-full py-3.5 rounded-xl btn-cream font-medium text-sm uppercase tracking-wider">
                Отправить заявку
              </button>
            </div>

            {/* Profile chips */}
            <div className="flex flex-wrap gap-3 mt-6">
              {profiles.map((p) => (
                <Link
                  key={p.label}
                  to="/quiz"
                  className="px-4 py-2 rounded-full border border-white/10 text-sm text-[#FAFAFA] hover:border-[#D4F87A] hover:text-[#D4F87A] transition-all"
                >
                  {p.emoji} {p.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Right: Spacer for visual balance on desktop */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
