"use client";

import React, { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GoogleMapsContext = createContext({
  isLoaded: false,
  loadError: null,
  hasApiKey: false,
});

const GOOGLE_MAP_LIBRARIES = ["places", "visualization"];

export function GoogleMapsProvider({ children }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "citycare-google-maps-script",
    googleMapsApiKey: apiKey || "",
    libraries: GOOGLE_MAP_LIBRARIES,
    version: "weekly",
  });

  return (
    <GoogleMapsContext.Provider
      value={{
        isLoaded,
        loadError,
        hasApiKey: Boolean(apiKey),
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMapsStatus() {
  return useContext(GoogleMapsContext);
}
