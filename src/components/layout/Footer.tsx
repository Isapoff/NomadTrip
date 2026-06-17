import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="bg-[#0A1017] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#D4F87A]">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M2 12h20" />
                <path d="M12 6l3 6-3 6-3-6z" />
              </svg>
              <span className="tracked-small text-[#FAFAFA]">NOMADTRIP</span>
            </Link>
            <p className="text-sm text-[#888888] leading-relaxed font-serif italic">
              Платформа персональных рекомендаций для путешествий по Кыргызстану. 47 маршрутов, 7 регионов, WSM-алгоритм подбора.
            </p>
          </div>

          {/* Routes */}
          <div>
            <h4 className="tracked-small text-[#FAFAFA] mb-4">Маршруты</h4>
            <div className="space-y-2">
              {["Иссык-Куль", "Нарын", "Ош", "Бишкек", "Жалал-Абад", "Талас", "Баткен"].map((region) => (
                <Link
                  key={region}
                  to={`/routes?region=${region}`}
                  className="block text-sm text-[#888888] hover:text-[#D4F87A] transition-colors"
                >
                  {region}
                </Link>
              ))}
              <Link to="/routes" className="block text-sm text-[#C9973A] hover:text-[#D4F87A] transition-colors mt-2">
                Все маршруты →
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="tracked-small text-[#FAFAFA] mb-4">Сервисы</h4>
            <div className="space-y-2">
              <Link to="/guesthouses" className="block text-sm text-[#888888] hover:text-[#D4F87A] transition-colors">
                Жильё и юрты
              </Link>
              <Link to="/map" className="block text-sm text-[#888888] hover:text-[#D4F87A] transition-colors">
                Карта КР
              </Link>
              <Link to="/quiz" className="block text-sm text-[#888888] hover:text-[#D4F87A] transition-colors">
                Подобрать тур
              </Link>
              <Link to="/builder" className="block text-sm text-[#888888] hover:text-[#D4F87A] transition-colors">
                Конструктор маршрута
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#888888]">
            © 2026 NomadTrip · Бишкек · 47 маршрутов · KGSTD 2025
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#888888] hover:text-[#D4F87A] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" className="text-[#888888] hover:text-[#D4F87A] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21.2 2H2.8C1.8 2 1 2.8 1 3.8v16.4c0 1 .8 1.8 1.8 1.8h18.4c1 0 1.8-.8 1.8-1.8V3.8C23 2.8 22.2 2 21.2 2z" />
                <path d="M6 8l5 4-5 4" />
                <path d="M13 18h5" />
              </svg>
            </a>
            <a href="#" className="text-[#888888] hover:text-[#D4F87A] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17.5 2c-1.8 0-3.3 1-4.1 2.5L12 7l-1.4-2.5C9.8 3 8.3 2 6.5 2 3.5 2 1 4.5 1 7.5c0 5.2 11 14.5 11 14.5s11-9.3 11-14.5C23 4.5 20.5 2 17.5 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
