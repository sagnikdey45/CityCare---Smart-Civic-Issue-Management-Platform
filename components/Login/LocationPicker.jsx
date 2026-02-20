"use client";

import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 22.5726, lng: 88.3639 }; // Default: Kolkata

export default function LocationPicker({ onDetect }) {
  const [coords, setCoords] = useState(defaultCenter);
  const [loading, setLoading] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState("");
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Detect user’s GPS location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        await reverseGeocode(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        toast.error("Location access denied or unavailable.");
        setLoading(false);
      }
    );
  }, []);

  // Reverse geocode coordinates → human address
  const reverseGeocode = async (lat, lng) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const results = await geocoder.geocode({ location: { lat, lng } });

      if (!results.results.length) {
        toast.error("No address found for this location.");
        return;
      }

      // Select the most complete (longest) formatted address
      const bestResult = results.results.reduce((a, b) =>
        a.formatted_address.length > b.formatted_address.length ? a : b
      );

      const components = bestResult.address_components;

      const city =
        components.find((c) => c.types.includes("locality"))?.long_name ||
        components.find((c) => c.types.includes("administrative_area_level_2"))
          ?.long_name ||
        "";
      const state =
        components.find((c) => c.types.includes("administrative_area_level_1"))
          ?.long_name || "";
      const region =
        components.find((c) => c.types.includes("sublocality_level_1"))
          ?.long_name ||
        components.find((c) => c.types.includes("neighborhood"))?.long_name ||
        "";
      const postal =
        components.find((c) => c.types.includes("postal_code"))?.long_name ||
        "";

      const formatted = bestResult.formatted_address;
      setDetectedAddress(formatted);
      toast.success(`📍 ${city}, ${state}`);

      onDetect({
        city,
        state,
        region,
        detectedAddress: formatted,
        postal,
        latitude: lat,
        longitude: lng,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to retrieve address. Try again.");
    }
  };

  // 🪄 Allow pin dragging for manual adjustment
  const handleMarkerDragEnd = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoords({ lat, lng });
    await reverseGeocode(lat, lng);
  };

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="space-y-3">
      <button
        onClick={detectLocation}
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg transition-colors"
      >
        <MapPin className="inline mr-2 w-5 h-5" />
        {loading ? "Detecting..." : "Detect My Location"}
      </button>

      {/* 🗺️ Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={coords}
        zoom={15}
        onLoad={(map) => (mapRef.current = map)}
      >
        <MarkerF
          position={coords}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>

      {/* Display detected / adjusted address */}
      {detectedAddress && (
        <div className="p-3 bg-slate-50 dark:bg-dark-400 rounded-lg border border-slate-200 dark:border-dark-500">
          <p className="text-14-medium text-slate-700 dark:text-slate-300">
            <strong>Detected Address:</strong>
            <br />
            {detectedAddress}
          </p>
        </div>
      )}
    </div>
  );
}
