"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Link2, AlertCircle } from "lucide-react";

export default function Location({ formData, setFormData, errors, setErrors }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteContainerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  /* --------------------------------------------------
     Load Google Maps Script (ONLY ONCE)
  -------------------------------------------------- */
  useEffect(() => {
    let isMounted = true;

    const loadGoogleMaps = async () => {
      if (!isMounted) return;

      // If already loaded
      if (window.google?.maps && mapRef.current) {
        initializeMap();
        return;
      }

      // Prevent duplicate script loading
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=weekly&libraries=maps,marker,places`;

        script.async = true;

        document.head.appendChild(script);

        script.onload = () => {
          if (mapRef.current) {
            initializeMap();
          }
        };
      }
    };

    // Small delay ensures DOM ref exists
    setTimeout(loadGoogleMaps, 0);

    return () => {
      isMounted = false;
    };
  }, []);

  /* --------------------------------------------------
     Initialize Map + Modern Autocomplete
  -------------------------------------------------- */
  async function initializeMap() {
    if (!window.google) return;

    // Import required modern libraries
    const { Map } = await window.google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } =
      await window.google.maps.importLibrary("marker");
    await window.google.maps.importLibrary("places");

    const center = {
      lat: formData.latitude || 20.5937,
      lng: formData.longitude || 78.9629,
    };

    const map = new Map(mapRef.current, {
      center,
      zoom: 16,
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
    });

    setMapInstance(map);

    // Modern marker (no deprecated warnings)
    const marker = new AdvancedMarkerElement({
      map,
      position: center,
      gmpDraggable: true,
    });

    markerRef.current = marker;

    marker.addListener("dragend", () => {
      const pos = marker.position;
      reverseGeocode(pos.lat, pos.lng);
    });

    /* --------------------------------------------------
       Modern Place Autocomplete
    -------------------------------------------------- */
    const placeAutocomplete =
      new window.google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "in" },
      });

    placeAutocomplete.classList.add(
      "w-full",
      "rounded-xl",
      "border-2",
      "transition-all",
      "outline-none",
      "focus:ring-4",
      "border-gray-200",
      "dark:border-gray-700",
      "focus:border-emerald-500",
      "dark:focus:border-emerald-400",
      "focus:ring-emerald-100",
      "dark:focus:ring-emerald-800",
      "bg-white",
      "dark:bg-gray-800",
      "text-gray-900",
      "dark:text-gray-100",
    );

    // Prevent duplicate rendering
    if (autocompleteContainerRef.current) {
      autocompleteContainerRef.current.innerHTML = "";
      autocompleteContainerRef.current.appendChild(placeAutocomplete);
    }

    placeAutocomplete.addEventListener("gmp-select", async (event) => {
      const place = event.placePrediction.toPlace();

      await place.fetchFields({
        fields: [
          "displayName",
          "formattedAddress",
          "location",
          "addressComponents",
        ],
      });

      if (!place.location) return;

      const lat = place.location.lat();
      const lng = place.location.lng();

      map.setCenter(place.location);
      map.setZoom(17);
      marker.position = place.location;

      fillForm(place, lat, lng);
    });
  }

  /* --------------------------------------------------
     Fill Form
  -------------------------------------------------- */
  function fillForm(place, lat, lng) {
    const components = place.addressComponents || [];

    const get = (type) =>
      components.find((c) => c.types.includes(type))?.longText || "";

    setFormData((prev) => ({
      ...prev,
      searchQuery: place.displayName || "",
      address: place.formattedAddress || "",
      city: get("locality") || "",
      state: get("administrative_area_level_1") || "",
      postal: get("postal_code") || "",
      googleMapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      latitude: lat,
      longitude: lng,
    }));

    setErrors((prev) => ({
      ...prev,
      address: "",
      city: "",
      state: "",
      postal: "",
    }));
  }

  /* --------------------------------------------------
     Reverse Geocode
  -------------------------------------------------- */
  async function reverseGeocode(lat, lng) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
    );

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return;

    const components = result.address_components || [];
    const get = (t) =>
      components.find((c) => c.types.includes(t))?.long_name || "";

    setFormData((prev) => ({
      ...prev,
      address: result.formatted_address,
      city: get("locality") || "",
      state: get("administrative_area_level_1") || "",
      postal: get("postal_code") || "",
      googleMapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      latitude: lat,
      longitude: lng,
    }));
  }

  /* --------------------------------------------------
     Current Location
  -------------------------------------------------- */
  function handleCurrentLocation() {
    if (!navigator.geolocation || !mapInstance) return;

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;

      mapInstance.setCenter({ lat: latitude, lng: longitude });
      mapInstance.setZoom(16);
      markerRef.current.position = { lat: latitude, lng: longitude };

      reverseGeocode(latitude, longitude);
    });
  }

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <MapPin className="text-emerald-600 dark:text-emerald-400" />
        Issue Location
      </h2>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Search Address *
        </label>

        <div ref={autocompleteContainerRef} />

        <button
          onClick={handleCurrentLocation}
          className="mt-3 w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-100 dark:focus:ring-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <Navigation size={16} className="inline mr-2" />
          Use Current Location
        </button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-80 rounded-xl border-2 border-gray-200 dark:border-gray-700"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {["address", "city", "state", "postal"].map((field) => (
          <div key={field}>
            <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
              {field === "postal" ? "Postal Code *" : `${field} *`}
            </label>

            <input
              value={formData[field] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 ${
                errors?.[field]
                  ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                  : "border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-100 dark:focus:ring-emerald-800"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
            />

            {errors?.[field] && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors[field]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Google Maps URL
        </label>

        <input
          value={formData.googleMapUrl || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              googleMapUrl: e.target.value,
            }))
          }
          className="w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-100 dark:focus:ring-emerald-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  );
}
