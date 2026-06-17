// Гео-утилиты для конструктора маршрутов

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Расстояние по прямой (хаверсин), км */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Дорожное расстояние ≈ прямая × коэффициент извилистости горных дорог КР */
export function roadKm(a: GeoPoint, b: GeoPoint): number {
  return haversineKm(a, b) * 1.4;
}

/** Время в пути на машине по горным дорогам (~45 км/ч средняя) */
export function driveHours(km: number): number {
  return km / 45;
}

export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)} мин`;
  const hours = Math.floor(h);
  const mins = Math.round((h - hours) * 60);
  return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
}

export interface SegmentInfo {
  km: number;
  hours: number;
}

/** Сегменты между последовательными точками + итоги */
export function routeSegments(stops: GeoPoint[]): {
  segments: SegmentInfo[];
  totalKm: number;
  totalHours: number;
} {
  const segments: SegmentInfo[] = [];
  let totalKm = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const km = roadKm(stops[i], stops[i + 1]);
    segments.push({ km, hours: driveHours(km) });
    totalKm += km;
  }
  return { segments, totalKm, totalHours: driveHours(totalKm) };
}

/** Ближайшие объекты к маршруту (не дальше maxKm от любой точки), отсортированы по близости */
export function nearbyObjects<T extends GeoPoint & { name?: string }>(
  stops: GeoPoint[],
  candidates: T[],
  maxKm = 60,
  limit = 6
): (T & { distKm: number })[] {
  if (stops.length === 0) return [];
  return candidates
    .map((c) => {
      const distKm = Math.min(...stops.map((s) => haversineKm(s, c)));
      return { ...c, distKm };
    })
    .filter((c) => c.distKm > 1 && c.distKm <= maxKm)
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, limit);
}

/** Жадная оптимизация порядка точек (ближайший сосед от первой точки) */
export function optimizeOrder<T extends GeoPoint>(stops: T[]): T[] {
  if (stops.length <= 2) return stops;
  const remaining = [...stops];
  const result = [remaining.shift()!];
  while (remaining.length) {
    const last = result[result.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversineKm(last, s);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    result.push(remaining.splice(bestIdx, 1)[0]);
  }
  return result;
}
