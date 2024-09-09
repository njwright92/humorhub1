"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

let API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const loader = new Loader({
  apiKey: API_KEY,
  version: "weekly",
  libraries: ["maps"],
});

const GoogleMap = ({ lat, lng, events }) => {
  const mapContainerRef = useRef(null);

  const loadMap = useCallback(async () => {
    try {
      await loader.load(); // Load the Google Maps JavaScript API

      const { google } = window; // Access the google object from the global window object

      if (mapContainerRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 10,
          mapId: "DEMO_MAP_ID", // Add a map ID (required for advanced markers)
        });

        events.forEach((event) => {
          const marker = new google.maps.Marker({
            map,
            position: { lat: event.lat, lng: event.lng },
            title: event.name, // Use title property for tooltip
          });

          const hoverInfoWindow = new google.maps.InfoWindow({
            content: `
            <div style="background-color: #f5f5f4; color: #18181b; padding: .75rem; border-radius: 3rem;">
            <h2 style="margin: .25rem; font-size: 1rem; font-weight: bold;">${event.name}</h2>
            <p style="margin: 0; font-size: .8rem;">${event.location}</p>
          </div>
            `,
          });

          marker.addListener("mouseover", () => {
            hoverInfoWindow.open({
              anchor: marker,
              map,
            });
          });

          marker.addListener("mouseout", () => {
            hoverInfoWindow.close();
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
            <div style="background-color: #f5f5f4; color: #18181b; padding: .75rem; border-radius: 3rem;">
                <h2 style="margin: .25rem; font-size: 1rem; font-weight: bold;">${event.name}</h2>
                <p style="margin: .25rem; font-size: .8rem;">${event.location}</p>
                <p style="margin: .25rem; font-size: .8rem;">${event.date}</p>
                <p style="margin: 0; font-size: .8rem;">${event.details}</p>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open({
              anchor: marker,
              map,
            });
          });
        });
      }
    } catch (error) {}
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
