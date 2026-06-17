import { useState } from "react";
import { useProviderAuth } from "@/hooks/useProviderAuth";
import { Lock, User, Loader2 } from "lucide-react";

export default function ProviderLogin() {
  const { login, isLoggingIn, loginError } = useProviderAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!loginValue || !password || isLoggingIn) return;
    try {
      await login({ login: loginValue, password });
    } catch {
      // error surfaced via loginError
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1017] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo / heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2D5A3D] mb-4">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl text-[#FAFAFA]">Кабинет провайдера</h1>
          <p className="text-xs text-[#888888] mt-2 uppercase tracking-wider">
            NOMADTRIP · Вход для партнёров
          </p>
        </div>

        {/* Form */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider mb-1.5 block">
              Логин
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
              />
              <input
                type="text"
                autoComplete="username"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="admin"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#555] focus:outline-none focus:border-[#2D5A3D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider mb-1.5 block">
              Пароль
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
              />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-[#555] focus:outline-none focus:border-[#2D5A3D] transition-colors"
              />
            </div>
          </div>

          {loginError && (
            <p className="text-xs text-[#E25555] bg-[#E25555]/10 border border-[#E25555]/20 rounded-lg px-3 py-2">
              {loginError}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoggingIn || !loginValue || !password}
            className="w-full py-2.5 bg-[#2D5A3D] hover:bg-[#346b48] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Вход…
              </>
            ) : (
              "Войти"
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-[#555] mt-6">
          Доступ только для зарегистрированных провайдеров.
          <br />
          Для получения доступа свяжитесь с администратором.
        </p>
      </div>
    </div>
  );
}
