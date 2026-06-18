import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair } from "lucide-react";
import { Button } from "./ui/button";

// Fix for default marker icon in Leaflet + React
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: [number, number];
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialLocation || [-6.2088, 106.8456]); // Default Jakarta
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const addr = data.display_name || `${lat}, ${lng}`;
      setAddress(addr);
      onLocationSelect(lat, lng, addr);
    } catch (error) {
      console.error("Geocoding error:", error);
      onLocationSelect(lat, lng, `${lat}, ${lng}`);
    } finally {
      setLoading(false);
    }
  }, [onLocationSelect]);

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  return (
    <div className="space-y-3">
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border shadow-inner">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={(pos) => {
            setPosition(pos);
            reverseGeocode(pos[0], pos[1]);
          }} />
          <MapCenterUpdater center={position} />
        </MapContainer>
        
        <div className="absolute bottom-4 right-4 z-1000">
          <Button
            size="icon"
            variant="secondary"
            className="size-10 rounded-full shadow-lg"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                  setPosition(newPos);
                  reverseGeocode(newPos[0], newPos[1]);
                });
              }
            }}
          >
            <Crosshair className="size-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
        <span className="line-clamp-2 leading-relaxed">
          {loading ? "Mencari alamat..." : address || "Ketuk peta untuk pilih lokasi"}
        </span>
      </div>
    </div>
  );
}

function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: [number, number], 
  setPosition: (pos: [number, number]) => void 
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}
