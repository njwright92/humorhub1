"use client";

import { useRef, useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const GoogleMap = ({ lat, lng, events }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. Initialize Map (Runs Only Once)
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: API_KEY,
        version: "weekly",
        libraries: ["places", "marker"],
      });

      try {
        await loader.load();
        const { google } = window;

        mapInstanceRef.current = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 12,
          mapId: "ac1223",
          disableDefaultUI: false,
          clickableIcons: false,
        });

        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 250,
        });

        setIsMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
      }
    };

    if (!mapInstanceRef.current) {
      initMap();
    }
  }, [lat, lng]);

  // 2. Handle Map Center Updates
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(12);
    }
  }, [lat, lng, isMapLoaded]);

  // 3. Handle Marker Updates
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !window.google) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    // Cleanup
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Create new
    events.forEach((event) => {
      const eventLat = Number(event.lat);
      const eventLng = Number(event.lng);

      if (isNaN(eventLat) || isNaN(eventLng)) return;

      const markerColor = event.festival
        ? "#a21caf"
        : event.isMusic
        ? "#2563eb"
        : "#22c55e";

      const markerContent = document.createElement("div");
      markerContent.className = "custom-marker";
      markerContent.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 32 32">
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

        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open({
          map: mapInstanceRef.current,
          anchor: marker,
        });
      });

      markersRef.current.push(marker);
    });
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
