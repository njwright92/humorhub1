"use client";

import { useRef, useEffect, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

// Use destructuring for cleaner access
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Initialize Loader once outside the component
const loader = new Loader({
  apiKey: API_KEY,
  version: "beta",
  libraries: ["places", "marker"],
});

const GoogleMap = ({ lat, lng, events }) => {
  const mapContainerRef = useRef(null);

  // 💡 FIX 1: Use a ref to store the currently open InfoWindow instance
  // This ref will hold the actual google.maps.InfoWindow object
  const currentInfoWindowRef = useRef(null);

  // 💡 OPTIMIZATION 1: Memoize marker creation logic (cleaner and avoids re-creation)
  const createMarkerContent = useCallback((event) => {
    let markerColor = "#22c55e"; // green (comedy/open mic)
    if (event.festival) markerColor = "#a21caf"; // purple (festival)
    else if (event.isMusic) markerColor = "#2563eb"; // blue (music/other)

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
    return markerContent;
  }, []);

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

            const markerContent = createMarkerContent(event);

            const marker = new AdvancedMarkerElement({
              map,
              position,
              title: event.name,
              content: markerContent,
            });

            marker.element.style.cursor = "pointer";

            // InfoWindow is created once per marker
            const infoWindow = new google.maps.InfoWindow({
              maxWidth: 250,
              content: `
                <div style="padding: .5rem; text-align: center; justify-content: center; background-color: #f5f5f5;">
                  <h2 style="font-weight: bold; color: black; margin-bottom: 0.25rem;">${
                    event.name
                  }</h2>
                  <p style="color: black; margin-bottom: 0.25rem;">${
                    event.location
                  }</p>
                  <p style="color: black; margin-bottom: 0.5rem;">${
                    event.date
                  }</p>
                  ${
                    event.details
                      ? `<p style="color: black; margin-top: 0.5rem;">${event.details}</p>`
                      : ""
                  }
                </div>
              `,
            });

            // 💡 FIX 2: Check for and close the previously opened info window
            const openInfoWindow = () => {
              // 1. Close the previous InfoWindow if it exists
              if (currentInfoWindowRef.current) {
                currentInfoWindowRef.current.close();
              }

              // 2. Open the new InfoWindow
              infoWindow.open({
                map,
                anchor: marker,
              });

              // 3. Update the ref to track the currently open InfoWindow
              currentInfoWindowRef.current = infoWindow;
            };

            // 💡 OPTIMIZATION 2: Use Google Maps API event listeners
            // The API listener is generally preferred for Maps objects.
            google.maps.event.addListener(marker, "click", openInfoWindow);
            google.maps.event.addListener(marker, "touchstart", openInfoWindow);

            // Note: Removed the original DOM listeners (marker.element.addEventListener)
          }
        });
      }
    } catch (error) {
      console.error("Error loading the map:", error);
    }
  }, [lat, lng, events, createMarkerContent]);

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
