"use client";

import { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useApiIsLoaded,
} from "@vis.gl/react-google-maps";

interface Event {
  lat: number | string;
  lng: number | string;
  name: string;
  location: string;
  date: string;
  details?: string;
  festival?: boolean;
  isMusic?: boolean;
}

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  events: Event[];
}

const EventPin = ({ color }: { color: string }) => (
  <div className="cursor-pointer hover:scale-110 transition-transform">
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))" }}
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        fill={color}
        stroke="#fff"
        strokeWidth="4"
      />
      <circle cx="16" cy="16" r="4" fill="#fff" />
    </svg>
  </div>
);

// ⭐ FIX IS HERE: Added safety checks to MapHandler
const MapHandler = ({
  place,
  zoom,
}: {
  place: { lat: number; lng: number };
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    // 1. Check if map instance exists
    if (!map) return;

    // 2. SAFETY CHECK: Ensure lat/lng are actual valid numbers before panning
    if (
      !place ||
      typeof place.lat !== "number" ||
      typeof place.lng !== "number" ||
      isNaN(place.lat) ||
      isNaN(place.lng)
    ) {
      return;
    }

    map.panTo(place);
    map.setZoom(zoom);
  }, [map, place, zoom]);

  return null;
};

// Internal component allows us to use useApiIsLoaded inside the Provider
const InnerMap = ({ lat, lng, zoom = 12, events }: GoogleMapProps) => {
  const apiIsLoaded = useApiIsLoaded();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getPinColor = (event: Event) => {
    if (event.festival) return "#a21caf";
    if (event.isMusic) return "#2563eb";
    return "#22c55e";
  };

  // Skeleton Loader: Shows while the heavy Google script downloads
  if (!apiIsLoaded) {
    return (
      <div className="h-full w-full bg-zinc-800 animate-pulse flex items-center justify-center text-zinc-500">
        <span className="font-semibold">Loading Map...</span>
      </div>
    );
  }

  return (
    <Map
      defaultCenter={{ lat, lng }}
      defaultZoom={zoom}
      mapId="ac1223"
      disableDefaultUI={false}
      clickableIcons={false}
      className="h-full w-full"
      onClick={() => setSelectedEvent(null)}
    >
      <MapHandler place={{ lat, lng }} zoom={zoom} />

      {events.map((event, index) => {
        const eventLat = Number(event.lat);
        const eventLng = Number(event.lng);
        // Safety check for markers too
        if (isNaN(eventLat) || isNaN(eventLng)) return null;

        return (
          <AdvancedMarker
            key={`${event.name}-${index}`}
            position={{ lat: eventLat, lng: eventLng }}
            onClick={() => setSelectedEvent(event)}
            title={event.name}
          >
            <EventPin color={getPinColor(event)} />
          </AdvancedMarker>
        );
      })}

      {selectedEvent && (
        <InfoWindow
          position={{
            lat: Number(selectedEvent.lat),
            lng: Number(selectedEvent.lng),
          }}
          onCloseClick={() => setSelectedEvent(null)}
          maxWidth={250}
          pixelOffset={[0, -30]}
        >
          <div style={{ padding: ".5rem", textAlign: "center", color: "#333" }}>
            <h2
              style={{
                fontWeight: "bold",
                fontSize: "1.1rem",
                marginBottom: ".25rem",
              }}
            >
              {selectedEvent.name}
            </h2>
            <p style={{ fontSize: ".9rem", marginBottom: ".25rem" }}>
              {selectedEvent.location}
            </p>
            <p
              style={{
                fontSize: ".85rem",
                color: "#555",
                marginBottom: ".5rem",
              }}
            >
              {selectedEvent.date}
            </p>
            {selectedEvent.details && (
              <p style={{ fontSize: ".85rem", marginTop: ".5rem" }}>
                {selectedEvent.details}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};

export default function GoogleMap(props: GoogleMapProps) {
  return (
    <div
      className="h-full w-full rounded-lg shadow-lg overflow-hidden bg-zinc-800 relative"
      style={{ minHeight: "400px" }}
    >
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      >
        <InnerMap {...props} />
      </APIProvider>
    </div>
  );
}
