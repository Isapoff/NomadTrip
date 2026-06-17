import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "@/store/mapStore";

interface MapViewProps {
  routes: any[];
  guesthouses: any[];
  objects?: any[];
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
};

function FlyToHandler() {
  const map = useMap();
  const flyTo = useMapStore((s) => s.flyTo);
  const zoom = useMapStore((s) => s.zoom);

  useEffect(() => {
    if (flyTo && map) {
      map.flyTo(flyTo, zoom, { duration: 1.2 });
    }
  }, [flyTo, zoom, map]);

  return null;
}

export default function MapView({ routes, guesthouses }: MapViewProps) {
  const activeRoute = useMapStore((s) => s.activeRoute);
  const setActiveRoute = useMapStore((s) => s.setActiveRoute);

  const activeRouteData = useMemo(() => {
    if (!activeRoute || !routes) return null;
    return routes.find((r: any) => r.routeId === activeRoute);
  }, [activeRoute, routes]);

  const pathCoords = useMemo(() => {
    if (!activeRouteData?.pathCoords) return null;
    try {
      return JSON.parse(activeRouteData.pathCoords);
    } catch {
      return null;
    }
  }, [activeRouteData]);

  return (
    <MapContainer
      center={[41.2, 74.6]}
      zoom={7}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%", background: "#0A1017" }}
    >
      <FlyToHandler />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route markers */}
      {routes?.map(
        (route) =>
          route.startLat &&
          route.startLng && (
            <CircleMarker
              key={route.routeId}
              center={[route.startLat, route.startLng]}
              radius={activeRoute === route.routeId ? 14 : 6}
              pathOptions={{
                color: activeRoute === route.routeId ? "#C9973A" : "#1A3A5C",
                fillColor: activeRoute === route.routeId ? "#FF8C40" : "#1A3A5C",
                weight: activeRoute === route.routeId ? 3 : 2,
                opacity: 1,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => setActiveRoute(route.routeId),
              }}
            >
              <Popup>
                <div className="text-[#0A1017] min-w-[180px]">
                  <p className="font-medium text-sm">{route.name}</p>
                  <p className="text-xs text-gray-500">
                    {route.region} · {route.durationDays} дней
                  </p>
                  <p className="text-xs text-[#C9973A] mt-1">
                    от {route.budgetPerDay.toLocaleString()} сом/день
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
      )}

      {/* Active route path */}
      {pathCoords && (
        <>
          <Polyline
            positions={pathCoords}
            pathOptions={{ color: "#FF8C40", weight: 12, opacity: 0.18 }}
          />
          <Polyline
            positions={pathCoords}
            pathOptions={{ color: "#C9973A", weight: 4, dashArray: "12,6", opacity: 0.9 }}
          />
        </>
      )}

      {/* Guesthouse markers */}
      {guesthouses?.map(
        (gh) =>
          gh.lat &&
          gh.lng && (
            <CircleMarker
              key={gh.ghId}
              center={[gh.lat, gh.lng]}
              radius={8}
              pathOptions={{
                color: ghColors[gh.type] || "#888888",
                fillColor: ghColors[gh.type] || "#888888",
                weight: 2,
                fillOpacity: 0.8,
              }}
            >
              <Popup>
                <div className="text-[#0A1017] min-w-[160px]">
                  <p className="font-medium text-sm">{gh.name}</p>
                  <p className="text-xs text-gray-500">
                    {gh.city} · {gh.type}
                  </p>
                  <p className="text-xs text-[#C9973A] mt-1">
                    {gh.pricePerNight.toLocaleString()} сом/ночь
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          )
      )}
    </MapContainer>
  );
}
