"use client";

import { useRef, useEffect, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const loader = new Loader({
  apiKey: API_KEY,
  version: "beta",
  libraries: ["places", "marker"],
});

const GoogleMap = ({ lat, lng, events }) => {
  const mapContainerRef = useRef(null);

  const loadMap = useCallback(async () => {
    try {
      await loader.load();
      const { google } = window;
      const { AdvancedMarkerElement } = google.maps.marker;

      if (mapContainerRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 10,
          mapId: "ac1223",
        });

        events.forEach((event) => {
          const eventLat = Number(event.lat);
          const eventLng = Number(event.lng);

          if (!isNaN(eventLat) && !isNaN(eventLng)) {
            const position = { lat: eventLat, lng: eventLng };

            // Marker color logic
            let markerColor = "#22c55e"; // green (comedy/open mic)
            if (event.festival) markerColor = "#a21caf"; // purple (festival)
            else if (event.isMusic) markerColor = "#2563eb"; // blue (music/other)

            // SVG marker
            const markerContent = document.createElement("div");
            markerContent.style.width = "32px";
            markerContent.style.height = "32px";
            markerContent.style.display = "flex";
            markerContent.style.justifyContent = "center";
            markerContent.style.alignItems = "center";
            markerContent.innerHTML = `
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="#fff" stroke-width="4"/>
                <circle cx="16" cy="16" r="4" fill="#fff" />
              </svg>
            `;

            const marker = new AdvancedMarkerElement({
              map,
              position,
              title: event.name,
              content: markerContent,
            });

            marker.element.style.cursor = "pointer";

            const infoWindow = new google.maps.InfoWindow({
              maxWidth: 250,
            });

            const openInfoWindow = () => {
              infoWindow.close();
              infoWindow.setContent(`
                <div style="padding: .5rem; text-align: center; justify-content: center; background-color: #f5f5f5;">
                  <h2 style="font-weight: bold; color: black;">${
                    event.name
                  }</h2>
                  <p style="color: black;">${event.location}</p>
                  <p style="color: black;">${event.date}</p>
                  ${
                    event.details
                      ? `<p style="color: black;">${event.details}</p>`
                      : ""
                  }
                </div>
              `);
              infoWindow.open({
                map,
                anchor: marker,
              });
            };

            marker.element.addEventListener("click", openInfoWindow);
            marker.element.addEventListener("touchstart", openInfoWindow);
          }
        });
      }
    } catch (error) {
      console.error("Error loading the map:", error);
    }
  }, [lat, lng, events]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  return (
    <div
      id="map"
      ref={mapContainerRef}
      style={{ height: "25rem", width: "100%", borderRadius: "1rem" }}
    ></div>
  );
};

export default GoogleMap;
