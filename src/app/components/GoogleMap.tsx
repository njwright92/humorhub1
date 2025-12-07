"use client";

import { useRef, useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  version: "weekly",
  libraries: ["places", "marker"],
});

let mapsLibrary: google.maps.MapsLibrary | null = null;
let markerLibrary: google.maps.MarkerLibrary | null = null;

const loadLibraries = async () => {
  if (!mapsLibrary)
    mapsLibrary = (await loader.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;
  if (!markerLibrary)
    markerLibrary = (await loader.importLibrary(
      "marker"
    )) as google.maps.MarkerLibrary;
  return { mapsLibrary, markerLibrary };
};

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

export default function GoogleMap({
  lat,
  lng,
  zoom = 4,
  events,
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        const { mapsLibrary } = await loadLibraries();
        if (!mounted || !mapContainerRef.current || mapInstanceRef.current)
          return;

        mapInstanceRef.current = new mapsLibrary.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 12,
          mapId: "ac1223",
          disableDefaultUI: false,
          clickableIcons: false,
        });

        infoWindowRef.current = new mapsLibrary.InfoWindow({ maxWidth: 250 });
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
    return () => {
      mounted = false;
    };
  }, [lat, lng]);

  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [lat, lng, isMapLoaded, zoom]);

  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    const updateMarkers = async () => {
      const { markerLibrary } = await loadLibraries();

      markersRef.current.forEach((m) => {
        m.map = null;
      });
      markersRef.current = [];

      events.forEach((event) => {
        const eventLat = Number(event.lat);
        const eventLng = Number(event.lng);
        if (isNaN(eventLat) || isNaN(eventLng)) return;

        const color = event.festival
          ? "#a21caf"
          : event.isMusic
            ? "#2563eb"
            : "#22c55e";

        const content = document.createElement("div");
        content.className =
          "cursor-pointer hover:scale-110 transition-transform";
        content.innerHTML = `
          <svg width="28" height="28" viewBox="0 0 32 32" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3))">
            <circle cx="16" cy="16" r="12" fill="${color}" stroke="#fff" stroke-width="4"/>
            <circle cx="16" cy="16" r="4" fill="#fff"/>
          </svg>
        `;

        const marker = new markerLibrary.AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: { lat: eventLat, lng: eventLng },
          title: event.name,
          content,
        });

        marker.addListener("click", () => {
          infoWindowRef.current?.setContent(`
            <div style="padding:.5rem;text-align:center;color:#333">
              <h2 style="font-weight:bold;font-size:1.1rem;margin-bottom:.25rem">${event.name}</h2>
              <p style="font-size:.9rem;margin-bottom:.25rem">${event.location}</p>
              <p style="font-size:.85rem;color:#555;margin-bottom:.5rem">${event.date}</p>
              ${event.details ? `<p style="font-size:.85rem;margin-top:.5rem">${event.details}</p>` : ""}
            </div>
          `);
          infoWindowRef.current?.open({
            map: mapInstanceRef.current,
            anchor: marker,
          });
        });

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [events, isMapLoaded]);

  return (
    <div
      ref={mapContainerRef}
      role="application"
      aria-label="Interactive map showing open mic locations and festivals"
      className="h-100 w-full rounded-lg shadow-lg overflow-hidden bg-zinc-800"
    />
  );
}
