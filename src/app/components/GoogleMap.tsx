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

type SelectedEvent = Event & { lat: number; lng: number };

const PIN_COLORS = {
  festival: "#7e22ce",
  music: "#15803d",
  default: "#bb4d00",
} as const;

const getPinColor = (event: Event) =>
  event.festival
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
      className="cursor-pointer transition-transform hover:scale-110"
      style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))" }}
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
  place,
  zoom,
}: {
  place: { lat: number; lng: number };
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || Number.isNaN(place.lat) || Number.isNaN(place.lng)) return;
    map.panTo(place);
    map.setZoom(zoom);
  }, [map, place, zoom]);

  return null;
}

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
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(
    null
  );

  const handleMarkerClick = useCallback((event: Event) => {
    const eventLat = Number(event.lat);
    const eventLng = Number(event.lng);
    if (!Number.isNaN(eventLat) && !Number.isNaN(eventLng)) {
      setSelectedEvent({ ...event, lat: eventLat, lng: eventLng });
    }
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
      onClick={() => setSelectedEvent(null)}
    >
      <MapHandler place={{ lat, lng }} zoom={zoom} />

      {events.map((event, index) => {
        const eventLat = Number(event.lat);
        const eventLng = Number(event.lng);
        if (Number.isNaN(eventLat) || Number.isNaN(eventLng)) return null;

        return (
          <AdvancedMarker
            key={event.id ?? `${event.name}-${eventLat}-${eventLng}-${index}`}
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
          position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
          onCloseClick={() => setSelectedEvent(null)}
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
              <p className="mt-2 text-left text-sm whitespace-pre-wrap">
                {selectedEvent.details}
              </p>
            )}
          </article>
        </InfoWindow>
      )}
    </Map>
  );
});

export default function GoogleMap(props: {
  lat: number;
  lng: number;
  zoom?: number;
  events: Event[];
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div
        className="grid size-full min-h-100 place-items-center overflow-hidden rounded-2xl bg-zinc-800 shadow-lg"
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
