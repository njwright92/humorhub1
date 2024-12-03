"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Include the 'marker' library in the Loader
const loader = new Loader({
  apiKey: API_KEY,
  version: "beta",
  libraries: ["places", "marker"],
});

const mapStyles = [
  {
    featureType: "all",
    elementType: "all",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }, { saturation: "-100" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [
      { saturation: 36 },
      { color: "#000000" },
      { lightness: 40 },
      { visibility: "off" },
    ],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "off" }, { color: "#000000" }, { lightness: 16 }],
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#000000" }, { lightness: 20 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#000000" }, { lightness: 17 }, { weight: 1.2 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#000000" }, { lightness: 20 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#4d6059" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4d6059" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [{ color: "#4d6059" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ lightness: 21 }],
  },
  {
    featureType: "poi",
    elementType: "geometry.fill",
    stylers: [{ color: "#4d6059" }],
  },
  {
    featureType: "poi",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4d6059" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ visibility: "on" }, { color: "#7f8d89" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#7f8d89" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#7f8d89" }, { lightness: 17 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#7f8d89" }, { lightness: 29 }, { weight: 0.2 }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#000000" }, { lightness: 18 }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#7f8d89" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.stroke",
    stylers: [{ color: "#7f8d89" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#000000" }, { lightness: 16 }],
  },
  {
    featureType: "road.local",
    elementType: "geometry.fill",
    stylers: [{ color: "#7f8d89" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry.stroke",
    stylers: [{ color: "#7f8d89" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#000000" }, { lightness: 19 }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#2b3638" }, { visibility: "on" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#2b3638" }, { lightness: 17 }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#24282b" }],
  },
  {
    featureType: "water",
    elementType: "geometry.stroke",
    stylers: [{ color: "#24282b" }],
  },
  {
    featureType: "water",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
];

const GoogleMap = ({ lat, lng, events }) => {
  const mapContainerRef = useRef(null);

  const loadMap = useCallback(async () => {
    try {
      await loader.load();

      const { google } = window;

      // Access AdvancedMarkerElement directly
      const { AdvancedMarkerElement } = google.maps.marker;

      if (mapContainerRef.current) {
        // Initialize the map with a mapId
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 10,
          styles: mapStyles,
          mapId: "ac1223", // Replace with your actual Map ID
        });

        events.forEach((event) => {
          const eventLat = parseFloat(event.lat);
          const eventLng = parseFloat(event.lng);

          if (!isNaN(eventLat) && !isNaN(eventLng)) {
            const position = { lat: eventLat, lng: eventLng };

            // Create the advanced marker
            const marker = new AdvancedMarkerElement({
              map,
              position,
              title: event.name,
            });

            // Add pointer cursor style to the marker's element
            marker.element.style.cursor = "pointer";

            const infoWindow = new google.maps.InfoWindow({
              maxWidth: 250,
            });

            // Attach event listener to marker.element
            marker.element.addEventListener("click", () => {
              infoWindow.close();
              infoWindow.setContent(`
                <div style="padding: .75rem; text-align: center; background-color: #f5f5f5;">
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
            });
          }
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
      style={{ height: "25rem", width: "100%", borderRadius: "1rem" }}
    ></div>
  );
};

export default GoogleMap;
