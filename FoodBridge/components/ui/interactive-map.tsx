"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ExternalLink, MapPin, Navigation, Route } from "lucide-react";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: any;
  }
}

type Marker = {
  label: string;
  position: string;
  type: "restaurant" | "ngo" | "delivery";
  coordinates: {
    lat: number;
    lng: number;
  };
};

const markerTone = {
  restaurant: "bg-warning text-white",
  ngo: "bg-primary text-primary-foreground",
  delivery: "bg-sky-500 text-white"
};

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#091122" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#091122" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1f2937" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#123322" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b1120" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#111827" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c4a6e" }] }
];

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-maps="true"]');

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.google.maps), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });
}

export function InteractiveMap({ title, markers }: { title: string; markers: Marker[] }) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = useId().replace(/:/g, "");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const primaryMarker = markers[0];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    primaryMarker ? `${primaryMarker.label} ${primaryMarker.position}` : "Mumbai India"
  )}`;

  useEffect(() => {
    if (!mapsApiKey) {
      setStatus("error");
      setErrorMessage("Missing Google Maps API key.");
      return;
    }

    if (!mapRef.current || markers.length === 0) {
      setStatus("error");
      setErrorMessage("No map markers available.");
      return;
    }

    let disposed = false;

    loadGoogleMaps(mapsApiKey)
      .then((maps) => {
        if (disposed || !mapRef.current) {
          return;
        }

        const map = new maps.Map(mapRef.current, {
          center: markers[0].coordinates,
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: mapStyle
        });

        const bounds = new maps.LatLngBounds();
        const infoWindow = new maps.InfoWindow();

        markers.forEach((marker) => {
          const pin = new maps.Marker({
            position: marker.coordinates,
            map,
            title: marker.label,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              fillColor: marker.type === "restaurant" ? "#fb923c" : marker.type === "ngo" ? "#59c17a" : "#38bdf8",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: 10
            }
          });

          pin.addListener("click", () => {
            infoWindow.setContent(
              `<div style="padding:8px 10px;color:#0f172a"><strong>${marker.label}</strong><br/>${marker.position}</div>`
            );
            infoWindow.open({ anchor: pin, map });
          });

          bounds.extend(marker.coordinates);
        });

        if (markers.length > 1) {
          map.fitBounds(bounds, 80);
        }

        setStatus("ready");
      })
      .catch((error: Error) => {
        if (disposed) {
          return;
        }

        setStatus("error");
        setErrorMessage(error.message);
      });

    return () => {
      disposed = true;
    };
  }, [mapsApiKey, markers]);

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/15 bg-slate-950 text-white shadow-soft">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-white/60">Google Maps layer</p>
            <h3 className="font-display text-xl font-semibold">{title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {status === "ready" ? "Live map ready" : status === "loading" ? "Loading map" : "Map unavailable"}
            </div>
            <Link
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10"
            >
              Open in Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {markers.map((marker) => (
            <div key={marker.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className={cn("rounded-full p-2.5", markerTone[marker.type])}>
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{marker.label}</div>
                <div className="text-xs text-white/65">{marker.position}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative h-[380px] bg-slate-950">
        <div id={mapId} ref={mapRef} className="absolute inset-0" />
        {status !== "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,146,43,0.18),transparent_24%),radial-gradient(circle_at_70%_65%,rgba(79,179,107,0.22),transparent_22%)]">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 text-center backdrop-blur">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <p className="mt-3 font-medium text-white">{status === "loading" ? "Loading Google Maps..." : "Google Maps could not load"}</p>
              <p className="mt-2 max-w-xs text-sm text-white/65">
                {status === "loading" ? "Pulling the live map canvas into your dashboard." : errorMessage ?? "Check API restrictions or billing in Google Cloud."}
              </p>
            </div>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 grid gap-3 rounded-[24px] border border-white/10 bg-slate-900/80 p-4 text-sm backdrop-blur sm:grid-cols-3">
          <div className="flex items-center gap-2 text-white/80">
            <Navigation className="h-4 w-4 text-primary" />
            Nearby matching
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Route className="h-4 w-4 text-warning" />
            Route-aware pickup windows
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="h-4 w-4 text-sky-400" />
            Live location-ready UI
          </div>
        </div>
      </div>
    </div>
  );
}
