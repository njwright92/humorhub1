"use client";

import { useRef, useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

// 1. OPTIMIZATION: Singleton Loader (Defined outside component)
const loader = new Loader({
  apiKey: API_KEY,
  version: "weekly",
  libraries: ["places", "marker"],
  id: "google-map-script",
});

// --- Types ---
interface Event {
  id?: string;
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
  events: Event[];
}

const GoogleMap = ({ lat, lng, events }: GoogleMapProps) => {
  // 2. TYPED REFS
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 3. INIT EFFECT (Runs Once)
  useEffect(() => {
    const initMap = async () => {
      try {
        // Import libraries safely
        const { Map } = (await loader.importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;
        const { InfoWindow } = (await loader.importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;

        if (mapContainerRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = new Map(mapContainerRef.current, {
            center: { lat, lng },
            zoom: 12,
            mapId: "ac1223",
            disableDefaultUI: false,
            clickableIcons: false,
          });

          infoWindowRef.current = new InfoWindow({
            maxWidth: 250,
          });

          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = Run once on mount

  // 4. PANNING EFFECT (Moves map on city change)
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(12);
    }
  }, [lat, lng, isMapLoaded]);

  // 5. MARKER EFFECT (Optimized)
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    const updateMarkers = async () => {
      // Import marker library
      const { AdvancedMarkerElement } = (await loader.importLibrary(
        "marker",
      )) as google.maps.MarkerLibrary;

      // CLEANUP: Remove old markers from map
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];

      const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

      events.forEach((event) => {
        const eventLat = Number(event.lat);
        const eventLng = Number(event.lng);

        if (isNaN(eventLat) || isNaN(eventLng)) return;

        const markerColor = event.festival
          ? "#a21caf" // Purple
          : event.isMusic
          ? "#2563eb" // Blue
          : "#22c55e"; // Green

        // Create DOM element
        const markerContent = document.createElement("div");
        markerContent.className =
          "custom-marker cursor-pointer hover:scale-110 transition-transform";
        // Kept your exact SVG and styling
        markerContent.innerHTML = `
          <svg width="28" height="28" viewBox="0 0 32 32" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));">
            <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="#fff" stroke-width="4"/>
            <circle cx="16" cy="16" r="4" fill="#fff"/>
          </svg>
        `;

        const marker = new AdvancedMarkerElement({
          map: mapInstanceRef.current,
          position: { lat: eventLat, lng: eventLng },
          title: event.name,
          content: markerContent,
        });

        marker.addListener("click", () => {
          // Kept your exact InfoWindow styling
          const contentString = `
            <div style="padding: .5rem; text-align: center; color: #333;">
              <h2 style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.25rem;">${
                event.name
              }</h2>
              <p style="font-size: 0.9rem; margin-bottom: 0.25rem;">${
                event.location
              }</p>
              <p style="font-size: 0.85rem; color: #555; margin-bottom: 0.5rem;">${
                event.date
              }</p>
              ${
                event.details
                  ? `<p style="font-size: 0.85rem; margin-top: 0.5rem;">${event.details}</p>`
                  : ""
              }
            </div>
          `;

          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(contentString);
            infoWindowRef.current.open({
              map: mapInstanceRef.current,
              anchor: marker,
            });
          }
        });

        newMarkers.push(marker);
      });

      markersRef.current = newMarkers;
    };

    updateMarkers();
  }, [events, isMapLoaded]);

  return (
    <div
      ref={mapContainerRef}
      role="application"
      aria-label="Interactive map showing comedy, music, and all-arts open mic locations and festivals across the USA"
      className="h-[25rem] w-full rounded-lg shadow-lg overflow-hidden bg-zinc-900"
    />
  );
};

export default GoogleMap;
