import { useEffect, useMemo } from "react";
import {
  MapContainer, TileLayer, CircleMarker, Popup, Polyline, Tooltip, LayersControl, useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "@/store/mapStore";
import { roadKm, driveHours, formatHours } from "@/lib/geo";

interface MapViewProps {
  routes: any[];
  guesthouses: any[];
  objects: any[];
  buildStops?: any[];
  onObjectClick?: (obj: any) => void;
}

const ghColors: Record<string, string> = {
  "Гостевой дом": "#2D5A3D",
  "Юрточный лагерь": "#C9973A",
  "Хостел": "#1A3A5C",
  "Homestay": "#1A6B8A",
  "Санаторий": "#6B4A9A",
  "Альп. лагерь": "#8B2020",
  "Пансионат": "#6B4A9A",
};

const catColors: Record<string, string> = {
  "Природный": "#2D7A4A",
  "Озеро": "#1A6B8A", "Ущелье": "#2D5A3D", "История": "#8B4A2A",
  "Рынок": "#C9973A", "Гора": "#6B4A9A", "Каравансарай": "#8B6020",
  "Лес": "#2D5A3D", "Водопад": "#1A6B8A", "Мавзолей": "#8B2020",
  "Музей": "#1A3A5C", "Заповедник": "#2D5A3D", "Долина": "#2D7A4A",
  "Площадь": "#888888", "Горнолыжная": "#1A3A5C", "Источники": "#1A6B8A",
  "Каньон": "#C9973A", "default": "#888888",
};

function FlyToHandler() {
  const map = useMap();
  const flyTo = useMapStore((s) => s.flyTo);
  const zoom = useMapStore((s) => s.zoom);
  useEffect(() => {
    if (flyTo && map) map.flyTo(flyTo, zoom, { duration: 1.2 });
  }, [flyTo, zoom, map]);
  return null;
}

export default function MapViewEnhanced({ routes, guesthouses, objects, buildStops = [], onObjectClick }: MapViewProps) {
  const activeRoute = useMapStore((s) => s.activeRoute);
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);

  const activeRouteData = useMemo(() => {
    if (!activeRoute || !routes) return null;
    return routes.find((r: any) => r.routeId === activeRoute);
  }, [activeRoute, routes]);

  const pathCoords = useMemo(() => {
    if (!activeRouteData?.pathCoords) return null;
    try { return JSON.parse(activeRouteData.pathCoords); }
    catch { return null; }
  }, [activeRouteData]);

  const buildPath = buildStops.filter(s => s.lat && s.lng).map(s => [s.lat, s.lng]);
  const buildStopIds = new Set(buildStops.map(s => s.id));

  return (
    <MapContainer
      center={[41.2, 74.6]}
      zoom={7}
      scrollWheelZoom
      style={{ width: "100%", height: "100%", background: "#0A1017" }}
    >
      <FlyToHandler />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="🗺 Схема">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="🌙 Тёмная">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="⛰ Рельеф">
          <TileLayer
            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            maxZoom={17}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="🛰 Спутник">
          <TileLayer
            attribution='&copy; Esri, Maxar, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Tourist objects */}
      {objects?.filter(o => o.lat && o.lng).map((obj) => {
        const inRoute = buildStopIds.has(obj.objectId);
        return (
          <CircleMarker
            key={obj.objectId}
            center={[obj.lat, obj.lng]}
            radius={inRoute ? 9 : 5}
            fillColor={inRoute ? "#D4F87A" : (catColors[obj.category] || catColors.default)}
            color={inRoute ? "#0A1017" : "white"}
            weight={inRoute ? 2 : 1}
            fillOpacity={0.85}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 170, maxWidth: 210 }}>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>
                  {obj.category || obj.type} · {obj.region}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A3A5C", marginBottom: 4 }}>
                  {obj.name}
                </div>
                {(obj.description || obj.desc) && (
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 6, lineHeight: 1.5 }}>
                    {obj.description || obj.desc}
                  </div>
                )}
                {obj.price > 0 && (
                  <div style={{ fontSize: 11, color: "#C9973A", marginBottom: 6 }}>
                    🎟 Вход: {obj.price.toLocaleString()} сом
                  </div>
                )}
                {obj.season && (
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>📅 {obj.season}</div>
                )}
                {onObjectClick && !inRoute && (
                  <button
                    onClick={() => onObjectClick(obj)}
                    style={{
                      width: "100%", padding: "6px 0", background: "#D4F87A",
                      color: "#0A1017", border: "none", borderRadius: 6,
                      fontSize: 11, fontWeight: 700, cursor: "pointer", marginTop: 4
                    }}
                  >
                    + Добавить в маршрут
                  </button>
                )}
                {inRoute && (
                  <div style={{ fontSize: 11, color: "#2D5A3D", fontWeight: 600, marginTop: 4 }}>
                    ✓ Уже в маршруте
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Route start markers */}
      {routes?.map((route) =>
        route.startLat && route.startLng ? (
          <CircleMarker
            key={route.routeId}
            center={[route.startLat, route.startLng]}
            radius={activeRoute === route.routeId ? 13 : 7}
            fillColor={activeRoute === route.routeId ? "#C9973A" : "#1A3A5C"}
            color="white"
            weight={activeRoute === route.routeId ? 2.5 : 1.5}
            fillOpacity={0.92}
            eventHandlers={{ click: () => setActiveRoute(route.routeId) }}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 200 }}>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", marginBottom: 3 }}>
                  {route.region} · {route.type}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A3A5C", marginBottom: 5 }}>
                  {route.name}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                  ⏱ {route.durationDays} дн. · 💰 {(route.budgetPerDay * route.durationDays).toLocaleString()} сом
                </div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>
                  🧗 Сложность {route.difficulty}/10 · ⭐ {route.rating}
                </div>
                {route.description && (
                  <div style={{ fontSize: 11, color: "#777", marginBottom: 6, lineHeight: 1.5, borderLeft: "2px solid #C9973A", paddingLeft: 7 }}>
                    {String(route.description).slice(0, 120)}{route.description?.length > 120 ? "…" : ""}
                  </div>
                )}
                {route.season && (
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>📅 {route.season}</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ) : null
      )}

      {/* Active route path */}
      {pathCoords && pathCoords.length > 1 && (
        <>
          <Polyline positions={pathCoords} pathOptions={{ color: "#FF8C40", weight: 14, opacity: 0.15 }} />
          <Polyline positions={pathCoords} pathOptions={{ color: "#C9973A", weight: 4, opacity: 1, dashArray: "12,6" }} />
          {pathCoords.map((pos: number[], i: number) => (
            <CircleMarker
              key={i}
              center={pos as [number, number]}
              radius={i === 0 ? 12 : 8}
              fillColor={i === 0 ? "#C9973A" : "#FF6B35"}
              color="white"
              weight={i === 0 ? 3 : 2}
              fillOpacity={1}
            >
              <Popup><b style={{ color: "#1A3A5C" }}>День {i + 1}</b></Popup>
            </CircleMarker>
          ))}
        </>
      )}

      {/* Guesthouses */}
      {guesthouses?.filter(g => g.lat && g.lng).map((gh) => (
        <CircleMarker
          key={gh.ghId}
          center={[gh.lat, gh.lng]}
          radius={9}
          fillColor={ghColors[gh.type] || "#2D5A3D"}
          color="white"
          weight={2}
          fillOpacity={0.9}
        >
          <Popup>
            <div style={{ fontFamily: "sans-serif", minWidth: 190 }}>
              <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", marginBottom: 3 }}>{gh.type}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1A3A5C", marginBottom: 4 }}>{gh.name}</div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
                {gh.description || gh.desc}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>📍 {gh.city}, {gh.region}</div>
              <div style={{ fontSize: 13, color: "#C9973A", fontWeight: 600, marginBottom: 4 }}>
                {(gh.pricePerNight || gh.price || 0).toLocaleString()} сом/ночь
              </div>
              <div style={{ fontSize: 11, color: "#2D5A3D", marginBottom: 4 }}>
                KGSTD {'⭐'.repeat(gh.kgstdStars || 0) || '—'} · {gh.kgstdPct || 0}%
              </div>
              {gh.phone && (
                <div style={{ fontSize: 10, color: "#888" }}>📞 {gh.phone}</div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Custom build route: segments with distance labels */}
      {buildPath.length > 1 && buildPath.slice(0, -1).map((_pos, i) => {
        const a = { lat: buildPath[i][0], lng: buildPath[i][1] };
        const b = { lat: buildPath[i + 1][0], lng: buildPath[i + 1][1] };
        const km = roadKm(a, b);
        const mid: [number, number] = [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
        return (
          <span key={`seg-${i}`}>
            <Polyline
              positions={[buildPath[i], buildPath[i + 1]] as [number, number][]}
              pathOptions={{ color: "#D4F87A", weight: 12, opacity: 0.1 }}
            />
            <Polyline
              positions={[buildPath[i], buildPath[i + 1]] as [number, number][]}
              pathOptions={{ color: "#D4F87A", weight: 4, opacity: 0.9, dashArray: "8,5" }}
            >
              <Tooltip position={mid} permanent direction="center" className="segment-label">
                {Math.round(km)} км · {formatHours(driveHours(km))}
              </Tooltip>
            </Polyline>
          </span>
        );
      })}

      {/* Custom route stop markers */}
      {buildStops.filter(s => s.lat && s.lng).map((stop, i) => (
        <CircleMarker
          key={stop.id + "-build"}
          center={[stop.lat, stop.lng]}
          radius={11}
          fillColor="#D4F87A"
          color="#0A1017"
          weight={2.5}
          fillOpacity={1}
        >
          <Popup>
            <div style={{ fontFamily: "sans-serif" }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Точка {i + 1}</div>
              <b style={{ color: "#2D5A3D", fontSize: 13 }}>{stop.name}</b>
              {(stop.description || stop.desc) && (
                <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
                  {stop.description || stop.desc}
                </div>
              )}
              {stop.region && (
                <div style={{ fontSize: 10, color: "#888", marginTop: 3 }}>📍 {stop.region}</div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
