// Подбор фотографии для маршрута: сначала по ключевым словам в названии,
// затем по типу, затем по региону (с вариативностью, чтобы не было повторов подряд)

const NAME_KEYWORDS: [string, string][] = [
  ["иссык-куль", "/issyk-kul.jpg"],
  ["пляж", "/issyk-kul.jpg"],
  ["сон-куль", "/images/sonkul-yurts.jpeg"],
  ["сонкуль", "/images/sonkul-yurts.jpeg"],
  ["кочев", "/images/sonkul-yurts.jpeg"],
  ["таш-рабат", "/tash-rabat.jpg"],
  ["шёлков", "/tash-rabat.jpg"],
  ["шелков", "/tash-rabat.jpg"],
  ["джети-огуз", "/jeti-oguz.jpg"],
  ["ала-куль", "/jeti-oguz.jpg"],
  ["каракол", "/jeti-oguz.jpg"],
  ["ош", "/images/osh-mosque.jpeg"],
  ["сулайман", "/images/osh-mosque.jpeg"],
  ["узген", "/images/osh-mosque.jpeg"],
  ["конн", "/horseman.jpg"],
  ["лошад", "/horseman.jpg"],
  ["юрт", "/yurt-family.jpg"],
  ["этно", "/yurt-family.jpg"],
  ["звёзд", "/milky-way-yurt.jpg"],
  ["звезд", "/milky-way-yurt.jpg"],
  ["ночн", "/milky-way-yurt.jpg"],
  ["пик ленина", "/hero-mountains.jpg"],
  ["альп", "/hero-mountains.jpg"],
  ["восхожден", "/hero-mountains.jpg"],
  ["перевал", "/images/too-ashuu.jpeg"],
  ["авто", "/images/too-ashuu.jpeg"],
  ["суусамыр", "/images/suusamyr.jpeg"],
  ["талас", "/images/suusamyr.jpeg"],
  ["манас", "/images/suusamyr.jpeg"],
  ["арсланбоб", "/images/horses-green.jpeg"],
  ["орех", "/images/horses-green.jpeg"],
  ["сары-челек", "/images/horses-green.jpeg"],
];

const TYPE_IMAGES: Record<string, string> = {
  "Конный": "/horseman.jpg",
  "Альпинизм": "/hero-mountains.jpg",
  "Этнокультурный": "/yurt-family.jpg",
  "Историко-культурный": "/tash-rabat.jpg",
  "Паломнический": "/images/osh-mosque.jpeg",
  "Автотур": "/images/too-ashuu.jpeg",
  "Пляжно-экскурсионный": "/issyk-kul.jpg",
  "Водный": "/issyk-kul.jpg",
};

// Несколько вариантов на регион — выбираем стабильно по id, чтобы соседние карточки различались
const REGION_IMAGES: Record<string, string[]> = {
  "Иссык-Куль": ["/issyk-kul.jpg", "/images/lake-yurts.jpeg", "/jeti-oguz.jpg"],
  "Нарын": ["/images/sonkul-yurts.jpeg", "/tash-rabat.jpg", "/milky-way-yurt.jpg"],
  "Ош": ["/images/osh-mosque.jpeg", "/hero-mountains.jpg"],
  "Бишкек": ["/images/too-ashuu.jpeg", "/hero-mountains.jpg"],
  "Талас": ["/images/suusamyr.jpeg", "/horseman.jpg"],
  "Жалал-Абад": ["/images/horses-green.jpeg", "/yurt-family.jpg"],
  "Баткен": ["/images/yurt-mountains.jpeg", "/hero-mountains.jpg"],
};

const FALLBACKS = [
  "/images/yurt-mountains.jpeg",
  "/images/lake-yurts.jpeg",
  "/milky-way-yurt.jpg",
  "/hero-mountains.jpg",
];

function hashId(id: string): number {
  return id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
}

export function routeImage(route: {
  routeId?: string;
  name?: string;
  type?: string;
  region?: string;
  imageUrl?: string | null;
}): string {
  if (route.imageUrl) return route.imageUrl;

  // 1. По названию (самое точное соответствие)
  const name = (route.name || "").toLowerCase();
  for (const [kw, img] of NAME_KEYWORDS) {
    if (name.includes(kw)) return img;
  }

  // 2. По типу
  if (route.type && TYPE_IMAGES[route.type]) return TYPE_IMAGES[route.type];

  // 3. По региону, вариант выбирается стабильно по id
  if (route.region && REGION_IMAGES[route.region]) {
    const variants = REGION_IMAGES[route.region];
    return variants[hashId(route.routeId || "R0") % variants.length];
  }

  return FALLBACKS[hashId(route.routeId || "R0") % FALLBACKS.length];
}

export function objectImage(obj: { region?: string; name?: string }): string {
  const name = (obj.name || "").toLowerCase();
  for (const [kw, img] of NAME_KEYWORDS) {
    if (name.includes(kw)) return img;
  }
  const variants = obj.region ? REGION_IMAGES[obj.region] : null;
  return variants ? variants[0] : FALLBACKS[0];
}
