import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const isHome = location.pathname === "/";

  const navItems = [
    { label: "Маршруты", href: "/routes" },
    { label: "Жильё", href: "/guesthouses" },
    { label: "Подобрать тур", href: "/quiz" },
    { label: "Карта", href: "/map" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome ? "bg-transparent" : "bg-[#0A1017]/90 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="w-full px-6 lg:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#D4F87A]">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M2 12h20" />
            <path d="M12 6l3 6-3 6-3-6z" />
          </svg>
          <span className="tracked-small text-[#FAFAFA] group-hover:text-[#D4F87A] transition-colors">
            NOMADTRIP
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Theme toggle + CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-[#FAFAFA] hover:border-[#D4F87A] hover:text-[#D4F87A] transition-all"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link
            to="/quiz"
            className="px-5 py-2 rounded-full border border-white/20 text-[11px] uppercase tracking-[0.18em] text-[#FAFAFA] hover:border-[#D4F87A] hover:text-[#D4F87A] transition-all duration-300"
          >
            Подобрать
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#FAFAFA]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A1017]/95 backdrop-blur-md border-t border-white/5 px-6 py-6 space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block tracked-small text-[#FAFAFA] hover:text-[#D4F87A] transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/quiz"
            className="inline-block mt-2 px-5 py-2 rounded-full border border-[#D4F87A] text-[11px] uppercase tracking-[0.18em] text-[#D4F87A]"
            onClick={() => setMobileOpen(false)}
          >
            Подобрать тур
          </Link>
          <button
            onClick={toggle}
            className="flex items-center gap-2 text-[#888888] hover:text-[#D4F87A] text-xs py-2 transition-colors"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </button>
        </div>
      )}
    </nav>
  );
}
