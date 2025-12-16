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
  <div className="cursor-pointer transition-transform hover:scale-110">
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))" }}
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        fill={color}
        stroke="#fff"
        strokeWidth="4"
      />
      <circle cx="16" cy="16" r="4" fill="#f0eee9" />
    </svg>
  </div>
));

EventPin.displayName = "EventPin";

const MapHandler = memo(
  ({ place, zoom }: { place: { lat: number; lng: number }; zoom: number }) => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;
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
  }
);

MapHandler.displayName = "MapHandler";

// 2. Updated Color Logic to match your Tabs
const getPinColor = (event: Event): string => {
  if (event.festival) return "#7e22ce";
  if (event.isMusic) return "#15803d";
  return "#bb4d00";
};

// Inner map component
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

  // Loading State -> Stone-800
  if (!apiIsLoaded) {
    return (
      <div className="flex h-full w-full animate-pulse items-center justify-center bg-stone-800 text-stone-400">
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
      className="size-full"
      onClick={handleMapClick}
    >
      <MapHandler place={{ lat, lng }} zoom={zoom} />

      {events.map((event, index) => {
        const eventLat = Number(event.lat);
        const eventLng = Number(event.lng);

        if (isNaN(eventLat) || isNaN(eventLng)) return null;

        return (
          <AdvancedMarker
            key={event.id || `${event.name}-${index}`}
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
          <article className="p-2 text-center text-zinc-800">
            <h2 className="mb-1 text-lg font-bold">{selectedEvent.name}</h2>
            <p className="mb-1 text-sm">
              <span aria-hidden="true">📍</span>
              <span className="sr-only">Location:</span>{" "}
              {selectedEvent.location}
            </p>
            <p className="mb-2 text-sm text-zinc-600">
              <span aria-hidden="true">📅</span>
              <span className="sr-only">Date:</span> {selectedEvent.date}
            </p>
            {selectedEvent.details && (
              <div
                className="mt-2 text-left text-sm"
                dangerouslySetInnerHTML={{ __html: selectedEvent.details }}
              />
            )}
          </article>
        </InfoWindow>
      )}
    </Map>
  );
});

InnerMap.displayName = "InnerMap";

export default function GoogleMap(props: GoogleMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className="flex size-full min-h-100 items-center justify-center overflow-hidden rounded-2xl bg-zinc-800 shadow-lg"
        role="alert"
      >
        <div className="p-4 text-center text-zinc-400">
          <p className="mb-2 text-lg font-semibold">
            <span aria-hidden="true">⚠️</span> Map Unavailable
          </p>
          <p className="text-sm">Google Maps API key is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative size-full min-h-100 overflow-hidden rounded-2xl bg-zinc-800 shadow-lg">
      <APIProvider apiKey={apiKey}>
        <InnerMap {...props} />
      </APIProvider>
    </div>
  );
}
