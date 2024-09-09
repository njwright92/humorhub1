"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

let API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const loader = new Loader({
  apiKey: API_KEY,
  version: "weekly",
  libraries: ["marker"], // Add the 'marker' library for advanced markers
});

const GoogleMap = ({ lat, lng, events }) => {
  const mapContainerRef = useRef(null);

  const loadMap = useCallback(async () => {
    try {
      await loader.load(); // Load the Google Maps JavaScript API

      const { google } = window; // Access the google object from the global window object
      const { AdvancedMarkerElement } = await google.maps.importLibrary(
        "marker"
      ); // Import AdvancedMarkerElement

      if (mapContainerRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 10,
          mapId: "DEMO_MAP_ID", // Add a map ID (required for advanced markers)
        });

        // Loop through the events to create markers
        events.forEach((event, i) => {
          // Validate lat and lng before creating a marker
          const eventLat = parseFloat(event.lat);
          const eventLng = parseFloat(event.lng);

          if (!isNaN(eventLat) && !isNaN(eventLng)) {
            const position = { lat: eventLat, lng: eventLng };

            const marker = new AdvancedMarkerElement({
              position,
              map,
              title: `${i + 1}. ${event.name}`,
              gmpClickable: true, // Enable clicking
            });

            // Create the info window
            const infoWindow = new google.maps.InfoWindow();

            // Add click event listener for the marker
            marker.addListener("click", ({}) => {
              infoWindow.close(); // Close any open info windows
              infoWindow.setContent(`
                <div style="background-color: #f5f5f4; color: #18181b; padding: .75rem; border-radius: 3rem;">
                  <h2 style="margin: .25rem; font-size: 1rem; font-weight: bold;">${event.name}</h2>
                  <p style="margin: 0; font-size: .8rem;">${event.location}</p>
                  <p style="margin: 0; font-size: .8rem;">${event.date}</p>
                </div>
              `);
              infoWindow.open(marker.map, marker); // Open the info window at the marker's location
            });
          } else {
            console.warn(`Invalid coordinates for event: ${event.name}`);
          }
        });
      }
    } catch (error) {
      console.error("Error loading map or markers:", error);
    }
  }, [lat, lng, events]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  return (
    <div
      id="map"
      ref={mapContainerRef}
      style={{ height: "25rem", width: "100%" }}
    ></div>
  );
};

export default GoogleMap;
