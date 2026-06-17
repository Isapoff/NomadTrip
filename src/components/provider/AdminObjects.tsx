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
  { key: "objectId", label: "ID объекта", placeholder: "O101", hint: "уникальный, напр. O101" },
  { key: "name", label: "Название", full: true },
  { key: "category", label: "Категория", placeholder: "Озеро / Гора / Музей / Каньон" },
  { key: "region", label: "Регион", type: "select", options: REGIONS },
  { key: "lat", label: "Широта", type: "number", step: 0.0001, hint: "обязательно для карты" },
  { key: "lng", label: "Долгота", type: "number", step: 0.0001, hint: "обязательно для карты" },
  { key: "price", label: "Цена входа, сом", type: "number", min: 0 },
  { key: "currency", label: "Валюта", placeholder: "сом" },
  { key: "season", label: "Сезон", placeholder: "Лето" },
  { key: "tags", label: "Теги", placeholder: "природа, фото", hint: "через запятую" },
  { key: "imageUrl", label: "URL картинки", full: true },
  { key: "description", label: "Описание", type: "textarea", full: true },
];

const emptyValues = {
  objectId: "",
  name: "",
  category: "",
  region: "",
  lat: undefined,
  lng: undefined,
  price: 0,
  currency: "сом",
  season: "Лето",
  tags: "",
  imageUrl: "",
  description: "",
};

export default function AdminObjects() {
  const utils = trpc.useUtils();
  const listQuery = trpc.objects.list.useQuery();
  const createM = trpc.objects.create.useMutation();
  const updateM = trpc.objects.update.useMutation();
  const removeM = trpc.objects.remove.useMutation();

  const refresh = () => {
    utils.objects.list.invalidate();
    utils.analytics.dashboard.invalidate();
  };

  return (
    <CrudPanel
      title="Объекты на карте"
      addLabel="+ Добавить объект"
      rows={listQuery.data ?? []}
      isLoading={listQuery.isLoading}
      columns={[
        { key: "objectId", label: "ID" },
        { key: "name", label: "Название" },
        { key: "category", label: "Категория" },
        { key: "region", label: "Регион" },
        {
          key: "coords",
          label: "Координаты",
          render: (r) =>
            r.lat != null && r.lng != null
              ? `${r.lat.toFixed(2)}, ${r.lng.toFixed(2)}`
              : "— нет —",
        },
      ]}
      fields={fields}
      emptyValues={emptyValues}
      toForm={(r) => ({
        objectId: r.objectId,
        name: r.name,
        category: r.category,
        region: r.region,
        lat: r.lat ?? undefined,
        lng: r.lng ?? undefined,
        price: r.price,
        currency: r.currency ?? "сом",
        season: r.season ?? "",
        tags: r.tags ?? "",
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
