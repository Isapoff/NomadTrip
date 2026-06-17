import { trpc } from "@/providers/trpc";
import { CrudPanel, type FieldDef } from "./adminUi";

const REGIONS = [
  "Иссык-Куль",
  "Чуйская",
  "Бишкек",
  "Бишкек/Чуйская",
  "Нарын",
  "Ош",
  "Жалал-Абад",
  "Талас",
  "Баткен",
  "Все регионы",
  "Разные",
];

const fields: FieldDef[] = [
  { key: "routeId", label: "ID маршрута", placeholder: "R48", hint: "уникальный, напр. R48" },
  { key: "name", label: "Название", full: true },
  { key: "region", label: "Регион", type: "select", options: REGIONS },
  { key: "type", label: "Тип", placeholder: "Треккинг" },
  { key: "durationDays", label: "Дней", type: "number", min: 1, max: 60 },
  { key: "budgetPerDay", label: "Бюджет/день, сом", type: "number", min: 0 },
  { key: "difficulty", label: "Сложность", type: "number", min: 1, max: 10, hint: "1–10" },
  { key: "rating", label: "Рейтинг", type: "number", min: 0, max: 5, step: 0.1, hint: "0–5" },
  { key: "season", label: "Сезон", placeholder: "Лето (июн-сен)" },
  { key: "transport", label: "Транспорт", placeholder: "Авто" },
  { key: "groupType", label: "Тип группы", placeholder: "Семейный" },
  { key: "profileMatch", label: "Профиль (WSM)", placeholder: "Adventure", hint: "для фильтра подбора" },
  { key: "natureScore", label: "Природа", type: "number", min: 1, max: 10, hint: "1–10, WSM" },
  { key: "cultureScore", label: "Культура", type: "number", min: 1, max: 10, hint: "1–10, WSM" },
  { key: "comfortScore", label: "Комфорт", type: "number", min: 1, max: 10, hint: "1–10, WSM" },
  { key: "adventureScore", label: "Приключения", type: "number", min: 1, max: 10, hint: "1–10, WSM" },
  { key: "costScore", label: "Стоимость", type: "number", min: 1, max: 10, hint: "1–10, WSM" },
  { key: "startLat", label: "Старт: широта", type: "number", step: 0.0001, hint: "для карты, напр. 42.49" },
  { key: "startLng", label: "Старт: долгота", type: "number", step: 0.0001, hint: "напр. 78.39" },
  { key: "objectIds", label: "ID объектов", full: true, placeholder: "O1,O9,O5", hint: "через запятую — точки на карте" },
  { key: "imageUrl", label: "URL картинки", full: true, placeholder: "/images/route.jpg" },
  { key: "description", label: "Описание (по дням)", type: "textarea", full: true },
];

const emptyValues = {
  routeId: "",
  name: "",
  region: "",
  type: "",
  durationDays: 3,
  budgetPerDay: 3000,
  difficulty: 3,
  rating: 4,
  season: "Лето (июн-сен)",
  transport: "Авто",
  groupType: "Экотурист",
  profileMatch: "Экотурист",
  natureScore: 5,
  cultureScore: 5,
  comfortScore: 5,
  adventureScore: 5,
  costScore: 5,
  startLat: 42.0,
  startLng: 75.0,
  objectIds: "",
  imageUrl: "",
  description: "",
};

export default function AdminRoutes() {
  const utils = trpc.useUtils();
  const listQuery = trpc.routes.list.useQuery();
  const createM = trpc.routes.create.useMutation();
  const updateM = trpc.routes.update.useMutation();
  const removeM = trpc.routes.remove.useMutation();

  const refresh = () => {
    utils.routes.list.invalidate();
    utils.analytics.dashboard.invalidate();
  };

  return (
    <CrudPanel
      title="Маршруты"
      addLabel="+ Добавить маршрут"
      rows={listQuery.data ?? []}
      isLoading={listQuery.isLoading}
      columns={[
        { key: "routeId", label: "ID" },
        { key: "name", label: "Название" },
        { key: "region", label: "Регион" },
        { key: "durationDays", label: "Дней" },
        {
          key: "budgetPerDay",
          label: "Бюджет",
          render: (r) => `${r.budgetPerDay} с`,
        },
        { key: "rating", label: "★" },
      ]}
      fields={fields}
      emptyValues={emptyValues}
      toForm={(r) => ({
        routeId: r.routeId,
        name: r.name,
        region: r.region,
        type: r.type,
        durationDays: r.durationDays,
        budgetPerDay: r.budgetPerDay,
        difficulty: r.difficulty,
        rating: r.rating,
        season: r.season,
        transport: r.transport,
        groupType: r.groupType,
        profileMatch: r.profileMatch ?? "",
        natureScore: r.natureScore,
        cultureScore: r.cultureScore,
        comfortScore: r.comfortScore,
        adventureScore: r.adventureScore,
        costScore: r.costScore,
        startLat: r.startLat ?? undefined,
        startLng: r.startLng ?? undefined,
        objectIds: r.objectIds ?? "",
        imageUrl: r.imageUrl ?? "",
        description: r.description ?? "",
      })}
      onSave={async (id, values) => {
        const res = id
          ? await updateM.mutateAsync({ id, ...(values as any) })
          : await createM.mutateAsync(values as any);
        refresh();
        return res;
      }}
      onDelete={async (id) => {
        await removeM.mutateAsync({ id });
        refresh();
      }}
    />
  );
}
