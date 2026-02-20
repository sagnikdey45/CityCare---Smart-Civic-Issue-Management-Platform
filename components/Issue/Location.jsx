"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Link2, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { set } from "date-fns";

export default function Location({ formData, setFormData, errors, setErrors }) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { theme } = useTheme();

  // --- Load Google Maps script once ---
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    if (document.getElementById("google-maps-script")) return;

    window.initMap = initMap;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    }&libraries=places&v=weekly&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
  }, [theme]);

  // --- Initialize the Map after script loads ---
  function initMap() {
    if (!window.google || !window.google.maps) return;

    const center = {
      lat: formData.latitude || 20.5937,
      lng: formData.longitude || 78.9629,
    };

    const mapObj = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 20,
      styles:
        theme === "dark"
          ? [
              { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
              {
                elementType: "labels.text.stroke",
                stylers: [{ color: "#1a1a1a" }],
              },
              {
                elementType: "labels.text.fill",
                stylers: [{ color: "#e0e0e0" }],
              },
              {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d6d6d6" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#182d1c" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#88c9a1" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#2c2c2c" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#e2e2e2" }],
              },
              {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#383838" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#444444" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f1f1f" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#1a1a1a" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#0f1b29" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#8cb4d1" }],
              },
            ]
          : [],
    });

    const marker = new window.google.maps.Marker({
      map: mapObj,
      position: center,
      draggable: true,
    });
    markerRef.current = marker;

    // Reverse geocode on drag
    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      reverseGeocode(pos.lat(), pos.lng());
    });

    // Autocomplete setup
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["address_components", "geometry", "formatted_address"],
        componentRestrictions: { country: "in" },
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        handleManualSearch();
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      mapObj.panTo({ lat, lng });
      mapObj.setZoom(15);
      marker.setPosition({ lat, lng });

      fillForm(place, lat, lng);
    });

    setMapLoaded(true);
  }

  // --- Helper: construct the longest formatted address ---
  const buildFullAddress = (components) => {
    if (!components) return "";
    const parts = [];
    const priority = [
      "premise",
      "subpremise",
      "establishment",
      "point_of_interest",
      "sublocality_level_3",
      "sublocality_level_2",
      "sublocality_level_1",
      "locality",
      "administrative_area_level_3",
      "administrative_area_level_2",
      "administrative_area_level_1",
      "country",
      "postal_code",
    ];
    priority.forEach((type) => {
      const comp = components.find((c) => c.types.includes(type));
      if (comp && !parts.includes(comp.long_name)) parts.push(comp.long_name);
    });
    return parts.join(", ");
  };

  // --- Fill form fields with place data ---
  const fillForm = (place, lat, lng) => {
    const components = place.address_components || [];

    const get = (t) =>
      components.find((c) => c.types.includes(t))?.long_name || "";

    const fullAddress =
      buildFullAddress(components) || place.formatted_address || "";

    setFormData({
      ...formData,
      searchQuery: inputRef.current.value,
      address: fullAddress, // longest formatted address
      city: get("locality") || get("administrative_area_level_2") || "",
      state: get("administrative_area_level_1") || "",
      postal: get("postal_code") || "",
      googleMapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      latitude: lat,
      longitude: lng,
    });

    setErrors((prev) => ({
      ...prev,
      address: "",
      city: "",
      state: "",
      postal: "",
    }));
  };

  // --- Reverse Geocoding for manual drag or current location ---
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await res.json();
      const result = data.results?.[0];
      if (!result) return;

      const components = result.address_components || [];
      const get = (t) =>
        components.find((c) => c.types.includes(t))?.long_name || "";

      const fullAddress =
        buildFullAddress(components) || result.formatted_address || "";

      setFormData({
        ...formData,
        searchQuery: inputRef.current?.value || "",
        address: fullAddress, // longest formatted address
        city: get("locality") || get("administrative_area_level_2") || "",
        state: get("administrative_area_level_1") || "",
        postal: get("postal_code") || "",
        googleMapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
      });

      setErrors((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        postal: "",
      }));
    } catch (err) {
      console.error("Reverse geocode failed:", err);
    }
  };

  // --- Manual search fallback when pressing Enter ---
  const handleManualSearch = async () => {
    const query = inputRef.current.value.trim();
    if (!query) return;

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query,
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await res.json();
      const result = data.results?.[0];
      if (!result) return alert("No matching address found.");

      const lat = result.geometry.location.lat;
      const lng = result.geometry.location.lng;

      const map = markerRef.current.getMap();
      map.panTo({ lat, lng });
      map.setZoom(15);
      markerRef.current.setPosition({ lat, lng });

      const components = result.address_components || [];
      const get = (t) =>
        components.find((c) => c.types.includes(t))?.long_name || "";
      const fullAddress =
        buildFullAddress(components) || result.formatted_address || "";

      setFormData({
        ...formData,
        searchQuery: query,
        address: fullAddress,
        city: get("locality") || get("administrative_area_level_2") || "",
        state: get("administrative_area_level_1") || "",
        postal: get("postal_code") || "",
        googleMapUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
      });

      setErrors((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        postal: "",
      }));
    } catch (err) {
      console.error("Manual geocode failed:", err);
    }
  };

  // --- Current location handler ---
  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !mapLoaded) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;
      const map = markerRef.current.getMap();
      map.panTo({ lat: latitude, lng: longitude });
      map.setZoom(15);
      markerRef.current.setPosition({ lat: latitude, lng: longitude });
      reverseGeocode(latitude, longitude);
      setErrors((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        postal: "",
      }));
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <MapPin className="text-emerald-600 dark:text-emerald-400" size={28} />
        Issue Location
      </h2>

      {/* Search field */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Search Address *
          </label>
          <button
            onClick={handleCurrentLocation}
            className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <Navigation size={16} /> Use Current
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type address..."
          value={formData.searchQuery || ""}
          onChange={(e) => {
            setFormData({ ...formData, searchQuery: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // optional (prevents form submit)

              handleManualSearch();

              setErrors((prev) => ({
                ...prev,
                address: "",
                city: "",
                state: "",
                postal: "",
              }));
            }
          }}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-800 outline-none transition-all duration-300"
        />
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-80 rounded-xl border-2 border-gray-200 dark:border-gray-700"
      />

      {/* Address info fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {["address", "city", "state", "postal"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 capitalize">
              {key === "postal" ? "Postal Code *" : `${key} *`}
            </label>
            <input
              value={formData[key] || ""}
              onChange={(e) => {
                setFormData({ ...formData, [key]: e.target.value });
                setErrors({ ...errors, [key]: "" });
              }}
              placeholder={`Type ${key === "postal" ? "postal code" : key}...`}
              className={`w-full px-4 py-3 rounded-xl border-2 
              ${
                errors[key]
                  ? "border-red-300 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/40"
                  : "border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-100 dark:focus:ring-emerald-800"
              }
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 outline-none transition-all duration-300
`}
            />
            {errors[key] && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors[key]}
              </p>
            )}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            Google Maps URL
            <Link2
              size={14}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </label>
          <input
            value={formData.googleMapUrl || ""}
            placeholder="Paste Google Maps URL..."
            onChange={(e) =>
              setFormData({ ...formData, googleMapUrl: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-800 outline-none transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
}
