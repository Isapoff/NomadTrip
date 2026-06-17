import { trpc } from "@/providers/trpc";
import { CrudPanel, type FieldDef } from "./adminUi";

const REGIONS = [
  "Иссык-Куль",
  "Чуйская",
  "Бишкек",
  "Нарын",
  "Ош",
  "Жалал-Абад",
  "Талас",
  "Баткен",
];

const fields: FieldDef[] = [
  { key: "ghId", label: "ID жилья", placeholder: "GH18", hint: "уникальный" },
  { key: "name", label: "Название", full: true },
  { key: "city", label: "Город", placeholder: "Каракол" },
  { key: "region", label: "Регион", type: "select", options: REGIONS },
  { key: "type", label: "Тип", placeholder: "Гостевой дом / Юрточный лагерь / Отель" },
  { key: "typeColor", label: "Цвет типа", placeholder: "#2D5A3D" },
  { key: "pricePerNight", label: "Цена/ночь, сом", type: "number", min: 0 },
  { key: "rating", label: "Рейтинг", type: "number", min: 0, max: 5, step: 0.1, hint: "0–5" },
  { key: "season", label: "Сезон", placeholder: "Лето" },
  { key: "phone", label: "Телефон", placeholder: "+996 700 ..." },
  { key: "lat", label: "Широта", type: "number", step: 0.0001, hint: "для карты" },
  { key: "lng", label: "Долгота", type: "number", step: 0.0001 },
  { key: "facilities", label: "Удобства", full: true, placeholder: "Wi-Fi, завтрак, парковка" },
  { key: "imageUrl", label: "URL картинки", full: true },
  { key: "description", label: "Описание", type: "textarea", full: true },
];

const emptyValues = {
  ghId: "",
  name: "",
  city: "",
  region: "",
  type: "Гостевой дом",
  typeColor: "#2D5A3D",
  pricePerNight: 2000,
  rating: 4,
  season: "Лето",
  phone: "",
  lat: undefined,
  lng: undefined,
  facilities: "",
  imageUrl: "",
  description: "",
};

export default function AdminGuesthouses() {
  const utils = trpc.useUtils();
  const listQuery = trpc.guesthouses.list.useQuery();
  const createM = trpc.guesthouses.create.useMutation();
  const updateM = trpc.guesthouses.update.useMutation();
  const removeM = trpc.guesthouses.remove.useMutation();

  const refresh = () => {
    utils.guesthouses.list.invalidate();
    utils.analytics.dashboard.invalidate();
  };

  return (
    <CrudPanel
      title="Жильё и гостевые дома"
      addLabel="+ Добавить жильё"
      rows={listQuery.data ?? []}
      isLoading={listQuery.isLoading}
      columns={[
        { key: "ghId", label: "ID" },
        { key: "name", label: "Название" },
        { key: "city", label: "Город" },
        { key: "type", label: "Тип" },
        {
          key: "pricePerNight",
          label: "Цена",
          render: (r) => `${r.pricePerNight} с`,
        },
        { key: "rating", label: "★" },
      ]}
      fields={fields}
      emptyValues={emptyValues}
      toForm={(r) => ({
        ghId: r.ghId,
        name: r.name,
        city: r.city,
        region: r.region,
        type: r.type,
        typeColor: r.typeColor ?? "",
        pricePerNight: r.pricePerNight,
        rating: r.rating ?? undefined,
        season: r.season ?? "",
        phone: r.phone ?? "",
        lat: r.lat ?? undefined,
        lng: r.lng ?? undefined,
        facilities: r.facilities ?? "",
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
