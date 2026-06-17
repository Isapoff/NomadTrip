import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";
import { trpc } from "@/providers/trpc";

const GOALS = [
  { value: "Природа", emoji: "🌿" },
  { value: "Культура", emoji: "🏛" },
  { value: "Приключения", emoji: "🏔" },
  { value: "Семейный", emoji: "👨‍👩‍👧" },
  { value: "Бюджетный", emoji: "💰" },
];

const SEASONS = [
  { value: "Лето", emoji: "☀️" },
  { value: "Весна-осень", emoji: "🍂" },
  { value: "Зима", emoji: "❄️" },
  { value: "Любой", emoji: "🔄" },
];

const GROUPS = [
  { value: "Соло", emoji: "👤" },
  { value: "Пара", emoji: "💑" },
  { value: "Семья", emoji: "👨‍👩‍👧" },
  { value: "Группа", emoji: "👥" },
];

const REGIONS = ["Иссык-Куль", "Бишкек", "Нарын", "Ош", "Жалал-Абад", "Талас", "Баткен"];

const FITNESS_LABELS = ["", "Новичок", "Любитель", "Средняя", "Хорошая", "Атлет"];

export default function QuizPage() {
  const navigate = useNavigate();
  const { prefs, step, setPref, setStep, setResults, setRecommending } = useQuizStore();

  const recommend = trpc.routes.recommend.useMutation({
    onSuccess: (data) => {
      setResults(data);
      setRecommending(false);
      navigate("/results");
    },
  });

  const handleFindRoutes = () => {
    setRecommending(true);
    recommend.mutate({
      budgetDay: prefs.budgetDay,
      days: prefs.days,
      season: prefs.season,
      group: prefs.group,
      fitness: prefs.fitness,
      goal: prefs.goal,
      regions: prefs.regions,
      wNature: prefs.wNature,
      wCulture: prefs.wCulture,
      wComfort: prefs.wComfort,
      wCost: prefs.wCost,
      wAdventure: prefs.wAdventure,
    });
  };

  const steps = [
    // Step 1: Goal
    <div key="1" className="space-y-6">
      <h2 className="font-serif text-2xl text-[#FAFAFA] italic mb-2">Цель путешествия</h2>
      <p className="text-xs text-[#888888]">Определяет ваш профиль из 5 типов туристов</p>
      <div className="flex flex-wrap gap-3">
        {GOALS.map((g) => (
          <button
            key={g.value}
            onClick={() => setPref("goal", g.value)}
            className={`px-5 py-3 rounded-xl text-sm transition-all ${
              prefs.goal === g.value
                ? "bg-[#D4F87A] text-[#0A1017] font-medium"
                : "bg-white/5 text-[#FAFAFA] hover:bg-white/10"
            }`}
          >
            {g.emoji} {g.value}
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Parameters
    <div key="2" className="space-y-6">
      <h2 className="font-serif text-2xl text-[#FAFAFA] italic mb-2">Параметры</h2>

      <div>
        <label className="block text-xs text-[#888888] uppercase tracking-wider mb-2">
          Бюджет в день: {prefs.budgetDay.toLocaleString()} сом
        </label>
        <input
          type="range"
          min={500}
          max={30000}
          step={500}
          value={prefs.budgetDay}
          onChange={(e) => setPref("budgetDay", Number(e.target.value))}
          className="w-full accent-[#C9973A]"
        />
        <div className="flex justify-between text-[10px] text-[#888888]">
          <span>500</span>
          <span>30 000</span>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#888888] uppercase tracking-wider mb-2">
          Длительность: {prefs.days} дней
        </label>
        <input
          type="range"
          min={1}
          max={21}
          value={prefs.days}
          onChange={(e) => setPref("days", Number(e.target.value))}
          className="w-full accent-[#C9973A]"
        />
        <div className="flex justify-between text-[10px] text-[#888888]">
          <span>1</span>
          <span>21</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-[#888888] uppercase tracking-wider mb-2">Сезон</p>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setPref("season", s.value)}
              className={`px-4 py-2 rounded-lg text-xs transition-all ${
                prefs.season === s.value
                  ? "bg-[#C9973A] text-[#0A1017] font-medium"
                  : "bg-white/5 text-[#FAFAFA] hover:bg-white/10"
              }`}
            >
              {s.emoji} {s.value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#888888] uppercase tracking-wider mb-2">Группа</p>
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.value}
              onClick={() => setPref("group", g.value)}
              className={`px-4 py-2 rounded-lg text-xs transition-all ${
                prefs.group === g.value
                  ? "bg-[#C9973A] text-[#0A1017] font-medium"
                  : "bg-white/5 text-[#FAFAFA] hover:bg-white/10"
              }`}
            >
              {g.emoji} {g.value}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Fitness
    <div key="3" className="space-y-6">
      <h2 className="font-serif text-2xl text-[#FAFAFA] italic mb-2">Физическая подготовка</h2>
      <div className="text-center">
        <span className="text-3xl font-display text-[#D4F87A]">{prefs.fitness}</span>
        <p className="text-sm text-[#FAFAFA] mt-1">{FITNESS_LABELS[prefs.fitness]}</p>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={prefs.fitness}
        onChange={(e) => setPref("fitness", Number(e.target.value))}
        className="w-full accent-[#C9973A]"
      />
      <div className="flex justify-between text-[10px] text-[#888888]">
        <span>Новичок</span>
        <span>Атлет</span>
      </div>
    </div>,

    // Step 4: WSM Criteria
    <div key="4" className="space-y-6">
      <h2 className="font-serif text-2xl text-[#FAFAFA] italic mb-2">Критерии WSM</h2>
      <div className="p-4 glass-panel rounded-lg">
        <p className="text-xs text-[#888888] leading-relaxed">
          Формула WSM: <span className="text-[#C9973A]">Score = w₁·Природа + w₂·Культура + w₃·Комфорт + w₄·Стоимость + w₅·Приключения</span>
        </p>
      </div>

      {[
        { key: "wNature" as const, label: "🌿 Природа", emoji: "🌿" },
        { key: "wCulture" as const, label: "🏛 Культура", emoji: "🏛" },
        { key: "wComfort" as const, label: "🏠 Комфорт", emoji: "🏠" },
        { key: "wCost" as const, label: "💰 Стоимость", emoji: "💰" },
        { key: "wAdventure" as const, label: "🏔 Приключения", emoji: "🏔" },
      ].map((criterion) => (
        <div key={criterion.key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#FAFAFA]">{criterion.label}</span>
            <span className="text-xs text-[#C9973A]">{prefs[criterion.key]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={prefs[criterion.key]}
            onChange={(e) => setPref(criterion.key, Number(e.target.value))}
            className="w-full accent-[#C9973A]"
          />
        </div>
      ))}
    </div>,

    // Step 5: Regions
    <div key="5" className="space-y-6">
      <h2 className="font-serif text-2xl text-[#FAFAFA] italic mb-2">Регионы</h2>
      <p className="text-xs text-[#888888]">Выберите регионы для поиска (по умолчанию все)</p>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((region) => (
          <button
            key={region}
            onClick={() => {
              const current = prefs.regions;
              if (current.includes(region)) {
                setPref("regions", current.filter((r) => r !== region));
              } else {
                setPref("regions", [...current, region]);
              }
            }}
            className={`px-4 py-2 rounded-lg text-xs transition-all ${
              prefs.regions.includes(region)
                ? "bg-[#C9973A] text-[#0A1017] font-medium"
                : "bg-white/5 text-[#888888] hover:bg-white/10"
            }`}
          >
            {region}
          </button>
        ))}
      </div>
      {prefs.regions.length === 0 && (
        <button
          onClick={() => setPref("regions", [...REGIONS])}
          className="text-xs text-[#D4F87A] hover:underline"
        >
          Выбрать все регионы
        </button>
      )}
    </div>,

    // Step 6: Summary
    <div key="6" className="space-y-6">
      <h2 className="font-serif text-2xl text-[#FAFAFA] italic mb-2">Проверьте ваши предпочтения</h2>

      <div className="glass-panel rounded-xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Цель:</span>
          <span className="text-[#FAFAFA]">{prefs.goal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Бюджет:</span>
          <span className="text-[#FAFAFA]">{prefs.budgetDay.toLocaleString()} сом/день</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Длительность:</span>
          <span className="text-[#FAFAFA]">{prefs.days} дней</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Сезон:</span>
          <span className="text-[#FAFAFA]">{prefs.season}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Группа:</span>
          <span className="text-[#FAFAFA]">{prefs.group}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Физ. подготовка:</span>
          <span className="text-[#FAFAFA]">{FITNESS_LABELS[prefs.fitness]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#888888]">Регионы:</span>
          <span className="text-[#FAFAFA] text-right">
            {prefs.regions.length === 7 ? "Все" : prefs.regions.join(", ")}
          </span>
        </div>
      </div>

      <button
        onClick={handleFindRoutes}
        disabled={recommend.isPending}
        className="w-full py-4 bg-[#C9973A] text-[#0A1017] font-medium rounded-xl hover:bg-[#D4A84A] transition-colors disabled:opacity-50"
      >
        {recommend.isPending ? "Подбор маршрутов..." : "🔍 Найти маршруты"}
      </button>
    </div>,
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0A1017] flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-[580px]">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step
                  ? "bg-[#C9973A] scale-125"
                  : s < step
                  ? "bg-[#C9973A]/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {steps[step - 1]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 text-sm text-[#888888] hover:text-[#FAFAFA] transition-colors disabled:opacity-30"
          >
            ← Назад
          </button>
          <span className="text-xs text-[#888888]">{step} / 6</span>
          {step < 6 && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-white/5 text-[#FAFAFA] text-sm rounded-lg hover:bg-white/10 transition-colors"
            >
              Далее →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
