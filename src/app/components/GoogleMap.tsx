"use client";

import { useState, useEffect, useCallback, memo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useApiIsLoaded,
} from "@vis.gl/react-google-maps";

// Import shared type from lib
import type { Event } from "../lib/types";

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  events: Event[];
}

// Memoized pin component for better performance with many markers
const EventPin = memo(({ color }: { color: string }) => (
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
));

EventPin.displayName = "EventPin";

// Map controller component with safety checks
const MapHandler = memo(
  ({ place, zoom }: { place: { lat: number; lng: number }; zoom: number }) => {
    const map = useMap();

    useEffect(() => {
      // Check if map instance exists
      if (!map) return;

      // Safety check: Ensure lat/lng are valid numbers before panning
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
  },
);

MapHandler.displayName = "MapHandler";

// Helper function to get pin color based on event type
const getPinColor = (event: Event): string => {
  if (event.festival) return "#a21caf"; // Purple for festivals
  if (event.isMusic) return "#2563eb"; // Blue for music
  return "#22c55e"; // Green for comedy mics
};

// Inner map component (uses hooks that require APIProvider context)
const InnerMap = memo(({ lat, lng, zoom = 12, events }: GoogleMapProps) => {
  const apiIsLoaded = useApiIsLoaded();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleMapClick = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleMarkerClick = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Skeleton loader while Google Maps API loads
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
      onClick={handleMapClick}
    >
      <MapHandler place={{ lat, lng }} zoom={zoom} />

      {events.map((event, index) => {
        const eventLat = Number(event.lat);
        const eventLng = Number(event.lng);

        // Safety check for markers
        if (isNaN(eventLat) || isNaN(eventLng)) return null;

        return (
          <AdvancedMarker
            key={`${event.id || event.name}-${index}`}
            position={{ lat: eventLat, lng: eventLng }}
            onClick={() => handleMarkerClick(event)}
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
          onCloseClick={handleInfoWindowClose}
          maxWidth={250}
          pixelOffset={[0, -30]}
        >
          <div className="p-2 text-center text-zinc-800">
            <h2 className="font-bold text-lg mb-1">{selectedEvent.name}</h2>
            <p className="text-sm mb-1">📍 {selectedEvent.location}</p>
            <p className="text-sm text-zinc-600 mb-2">
              📅 {selectedEvent.date}
            </p>
            {selectedEvent.details && (
              <div
                className="text-sm mt-2 text-left"
                dangerouslySetInnerHTML={{ __html: selectedEvent.details }}
              />
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
});

InnerMap.displayName = "InnerMap";

// Main export component
export default function GoogleMap(props: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Handle missing API key gracefully
  if (!apiKey) {
    return (
      <div className="h-full w-full rounded-lg shadow-lg overflow-hidden bg-zinc-800 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-zinc-400 p-4">
          <p className="text-lg font-semibold mb-2">⚠️ Map Unavailable</p>
          <p className="text-sm">Google Maps API key is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full rounded-lg shadow-lg overflow-hidden bg-zinc-800 relative"
      style={{ minHeight: "400px" }}
    >
      <APIProvider apiKey={apiKey}>
        <InnerMap {...props} />
      </APIProvider>
    </div>
  );
}
