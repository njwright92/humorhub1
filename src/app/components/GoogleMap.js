"use client";

import { useRef, useEffect, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Include the 'marker' library in the Loader
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

      // Access AdvancedMarkerElement directly
      const { AdvancedMarkerElement } = google.maps.marker;

      if (mapContainerRef.current) {
        // Initialize the map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 10,
          mapId: "ac1223", // Replace with your actual Map ID
        });

        events.forEach((event) => {
          const eventLat = Number(event.lat); // Ensure exact latitude
          const eventLng = Number(event.lng); // Ensure exact longitude

          if (!isNaN(eventLat) && !isNaN(eventLng)) {
            const position = { lat: eventLat, lng: eventLng }; // Use unaltered coordinates

            // Create the advanced marker
            const marker = new AdvancedMarkerElement({
              map,
              position,
              title: event.name,
            });

            // Enable pointer cursor for interactivity
            marker.element.style.cursor = "pointer";

            const infoWindow = new google.maps.InfoWindow({
              maxWidth: 250,
            });

            // Function to open InfoWindow
            const openInfoWindow = () => {
              infoWindow.close();
              infoWindow.setContent(`
                <div style="padding: .5rem; text-align: center; justify-content: center; background-color: #f5f5f5;">
                  <h2 style="font-weight: bold; color: black;">${event.name}</h2>
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

            // Attach events
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
