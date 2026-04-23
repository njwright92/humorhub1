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
import type { Event } from "../lib/types";

const PIN_COLORS = {
  festival: "#7e22ce",
  music: "#15803d",
  default: "#bb4d00",
} as const;

const getPinColor = (event: Event) =>
  event.isFestival
    ? PIN_COLORS.festival
    : event.isMusic
      ? PIN_COLORS.music
      : PIN_COLORS.default;

function EventPin({ color }: { color: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      className="pin-drop-shadow cursor-pointer hover:scale-110"
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        fill={color}
        stroke="#fff"
        strokeWidth={4}
      />
      <circle cx="16" cy="16" r="4" fill="#f0eee9" />
    </svg>
  );
}

function MapHandler({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || Number.isNaN(lat) || Number.isNaN(lng)) return;
    map.panTo({ lat, lng });
    map.setZoom(zoom);
  }, [map, lat, lng, zoom]);

  return null;
}
const EventMarker = memo(function EventMarker({
  event,
  onClick,
}: {
  event: Event;
  onClick: (event: Event) => void;
}) {
  if (Number.isNaN(event.lat) || Number.isNaN(event.lng)) return null;

  return (
    <AdvancedMarker
      position={{ lat: event.lat, lng: event.lng }}
      onClick={() => onClick(event)}
      title={event.name}
    >
      <EventPin color={getPinColor(event)} />
    </AdvancedMarker>
  );
});

const InnerMap = memo(function InnerMap({
  lat,
  lng,
  zoom = 12,
  events,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  events: Event[];
}) {
  const apiIsLoaded = useApiIsLoaded();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleMarkerClick = useCallback((event: Event) => {
    setSelectedEvent(event);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  if (!apiIsLoaded) {
    return (
      <div className="grid size-full animate-pulse place-items-center bg-stone-800 text-stone-400">
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
      onClick={clearSelection}
    >
      <MapHandler lat={lat} lng={lng} zoom={zoom} />

      {events.map((event) => (
        <EventMarker key={event.id} event={event} onClick={handleMarkerClick} />
      ))}

      {selectedEvent && (
        <InfoWindow
          position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
          onCloseClick={clearSelection}
          // Set this slightly larger than your internal div
          maxWidth={280}
          pixelOffset={[0, -30]}
          headerDisabled
        >
          {/* Removed transform-gpu and fixed the width to 230px */}
          <article className="relative w-57 bg-white p-3 pt-6 text-center text-stone-900">
            {/* Small, clean close button */}
            <button
              onClick={clearSelection}
              className="absolute top-1 right-1 grid size-5 cursor-pointer place-items-center rounded-full bg-stone-100 text-stone-800 transition-colors hover:bg-stone-200 hover:text-stone-900"
              aria-label="Close"
              type="button"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>

            {/* break-words is the key to preventing horizontal scrolling */}
            <h2 className="break-word mb-1 text-sm leading-tight font-bold">
              {selectedEvent.name}
            </h2>

            <div className="space-y-1 text-xs text-stone-600">
              <p className="break-word">
                <span aria-hidden="true">📍</span> {selectedEvent.location}
              </p>
              <p>
                <span aria-hidden="true">📅</span> {selectedEvent.date}
              </p>
            </div>

            {selectedEvent.details && (
              <div className="mt-2 border-t border-stone-100 pt-2">
                <p className="text-left text-[11px] leading-relaxed whitespace-pre-wrap text-stone-500">
                  {selectedEvent.details.length > 120
                    ? `${selectedEvent.details.substring(0, 120)}...`
                    : selectedEvent.details}
                </p>
              </div>
            )}
          </article>
        </InfoWindow>
      )}
    </Map>
  );
});

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function GoogleMap(props: {
  lat: number;
  lng: number;
  zoom?: number;
  events: Event[];
}) {
  if (!API_KEY) {
    return (
      <div
        className="card-shell grid size-full min-h-96 place-items-center overflow-hidden bg-stone-800"
        role="alert"
      >
        <div className="grid gap-2 p-4 text-center text-zinc-400">
          <p className="text-lg font-semibold">
            <span aria-hidden="true">⚠️</span> Map Unavailable
          </p>
          <p className="text-sm">Google Maps API key is not configured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-shell relative size-full min-h-96 overflow-hidden bg-stone-800">
      <APIProvider apiKey={API_KEY}>
        <InnerMap {...props} />
      </APIProvider>
    </div>
  );
}
