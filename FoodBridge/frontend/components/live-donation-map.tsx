"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer, Polyline } from "@react-google-maps/api";
import { Loader2, Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";

const containerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "16px",
};

// Base center around Mumbai (Bandra area, mostly land)
const center = {
  lat: 19.0650,
  lng: 72.8350,
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

function getDeterministicPos(str: string, baseLat: number, baseLng: number, radius: number = 0.03) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rng = Math.abs(Math.sin(hash));
  const rng2 = Math.abs(Math.cos(hash));

  return {
    lat: baseLat + (rng - 0.5) * radius * 2,
    lng: baseLng + (rng2 - 0.5) * radius * 2
  };
}

export type MapDonation = {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
  status: string;
  donorId: string;
  ngoId: string | null;
  donor?: { name: string; email: string } | null;
  ngo?: { name: string; email: string } | null;
};

interface LiveDonationMapProps {
  donations: MapDonation[];
  mode: "NGO" | "DELIVERY";
  onAcceptPickup?: (id: string) => void;
  userEmail: string;
}

export function LiveDonationMap({ donations, mode, onAcceptPickup, userEmail }: LiveDonationMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [directions, setDirections] = useState<Record<string, google.maps.DirectionsResult | null>>({});

  const userLoc = useMemo(() => getDeterministicPos(userEmail, center.lat, center.lng, 0.01), [userEmail]);

  useEffect(() => {
    if (isLoaded && mode === "DELIVERY" && window.google) {
      donations.forEach(d => {
        if (!directions[d.id] && (d.status === "DELIVERY_ACCEPTED" || d.status === "PICKED_UP")) {
          const directionsService = new window.google.maps.DirectionsService();
          const deliveryLoc = getDeterministicPos(d.id + "driver", userLoc.lat, userLoc.lng, 0.015);
          const donorLoc = getDeterministicPos(d.id, center.lat, center.lng);
          const ngoLoc = getDeterministicPos(d.ngoId || "ngo", center.lat, center.lng);

          const origin = d.status === "DELIVERY_ACCEPTED" ? deliveryLoc : donorLoc;
          const dest = d.status === "DELIVERY_ACCEPTED" ? donorLoc : ngoLoc;

          directionsService.route(
            {
              origin,
              destination: dest,
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
              if (status === window.google.maps.DirectionsStatus.OK && result) {
                setDirections(prev => ({ ...prev, [d.id]: result }));
              }
            }
          );
        }
      });
    }
  }, [donations, mode, isLoaded, userLoc, directions]);

  if (!isLoaded) return <div className="flex h-[450px] w-full items-center justify-center rounded-2xl bg-muted/20 border border-white/5"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-white/10 shadow-xl">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLoc}
        zoom={13}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {/* Render NGO/Delivery base location */}
        <Marker
          position={userLoc}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: mode === "NGO" ? "#10b981" : "#3b82f6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            scale: 8,
          }}
          label={{
            text: mode === "NGO" ? "Your NGO" : "Your Location",
            color: "#ffffff",
            fontSize: "12px",
            className: "mt-8 bg-black/50 px-2 py-1 rounded backdrop-blur-sm",
          }}
        />

        {mode === "NGO" && donations.map(d => {
          const loc = getDeterministicPos(d.id, center.lat, center.lng);
          // Calculate a rough distance randomly generated between 1 and 8 km
          const distanceStr = ((Math.abs(Math.sin(loc.lat)) * 5) + 0.5).toFixed(1) + " km";

          return (
            <Marker
              key={d.id}
              position={loc}
              onClick={() => setActiveMarker(d.id)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: "#f97316", // Orange for donor
                fillOpacity: 0.9,
                strokeWeight: 3,
                strokeColor: "rgba(249, 115, 22, 0.3)",
                scale: 7,
              }}
            >
              {activeMarker === d.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="max-w-[200px] p-1 text-black">
                    <h4 className="font-bold text-base mb-1">{d.donor?.name || d.location}</h4>
                    <p className="text-sm"><strong>Food:</strong> {d.foodType}</p>
                    <p className="text-sm"><strong>Qty:</strong> {d.quantity}</p>
                    <p className="text-sm"><strong>Dist:</strong> {distanceStr}</p>
                    <p className="text-sm mb-3"><strong>Pickup:</strong> {d.expiryTime}</p>
                    {onAcceptPickup && (
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 bg-black hover:bg-black/80"
                        onClick={() => {
                          onAcceptPickup(d.id);
                          setActiveMarker(null);
                        }}
                      >
                        Accept Pickup
                      </Button>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}

        {mode === "DELIVERY" && Object.entries(directions).map(([id, result]) => {
          if (!result) return null;
          const donation = donations.find(d => d.id === id);
          if (!donation) return null;

          return (
            <React.Fragment key={id}>
              <DirectionsRenderer
                directions={result}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#3b82f6",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                  }
                }}
              />
              {/* Marker for current Target */}
              <Marker
                position={result.routes[0].legs[0].end_location}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: donation.status === "DELIVERY_ACCEPTED" ? "#f97316" : "#10b981", // orange for pickup, green for delivery
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#fff",
                  scale: 8,
                }}
              />
              <InfoWindow position={result.routes[0].legs[0].end_location} options={{ disableAutoPan: true }}>
                <div className="text-black font-semibold text-xs px-1">
                  {donation.status === "DELIVERY_ACCEPTED" ? "Navigate to Pickup" : "Navigate to NGO"}
                </div>
              </InfoWindow>
            </React.Fragment>
          );
        })}
      </GoogleMap>

      {/* Overlay Stats */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="rounded-xl bg-background/80 backdrop-blur-md px-4 py-3 border border-white/10 shadow-lg flex gap-4 pointer-events-auto">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Active</p>
            <p className="font-semibold text-sm leading-none">{donations.length} Orders</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Avg Time</p>
            <p className="font-semibold text-sm leading-none">14 min</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Coverage</p>
            <p className="font-semibold text-sm leading-none">5 km</p>
          </div>
        </div>
      </div>
    </div>
  );
}
