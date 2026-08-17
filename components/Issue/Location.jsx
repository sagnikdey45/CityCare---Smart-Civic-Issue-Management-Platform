"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Link2, AlertCircle, Info, Lock } from "lucide-react";

const DEFAULT_MAP_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

export default function Location({ formData, setFormData, errors, setErrors }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteContainerRef = useRef(null);
  const themeObserverRef = useRef(null); // cleans up MutationObserver on unmount

  const [manualMode, setManualMode] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapError, setMapError] = useState("");

  const manualModeRef = useRef(manualMode);
  useEffect(() => {
    manualModeRef.current = manualMode;
  }, [manualMode]);

  /* --------------------------------------------------
     Clean up map references when entering Manual Mode
  -------------------------------------------------- */
  useEffect(() => {
    if (manualMode) {
      setMapInstance(null);
      markerRef.current = null;
      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
        themeObserverRef.current = null;
      }
    }
  }, [manualMode]);

  /* --------------------------------------------------
     Reactive Google Maps URL Generation in Manual Mode
  -------------------------------------------------- */
  useEffect(() => {
    if (!manualMode) return;

    const rawLat = formData.latitude;
    const rawLng = formData.longitude;

    if (
      rawLat === null ||
      rawLat === undefined ||
      rawLat === "" ||
      rawLng === null ||
      rawLng === undefined ||
      rawLng === ""
    ) {
      if (formData.googleMapUrl !== "") {
        setFormData((prev) => ({ ...prev, googleMapUrl: "" }));
      }
      return;
    }

    const lat = Number(rawLat);
    const lng = Number(rawLng);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      const generatedUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      if (formData.googleMapUrl !== generatedUrl) {
        setFormData((prev) => ({ ...prev, googleMapUrl: generatedUrl }));
      }
    } else {
      if (formData.googleMapUrl !== "") {
        setFormData((prev) => ({ ...prev, googleMapUrl: "" }));
      }
    }
  }, [manualMode, formData.latitude, formData.longitude, setFormData, formData.googleMapUrl]);

  /* --------------------------------------------------
     Load Google Maps Script (ONLY WHEN manualMode === false)
  -------------------------------------------------- */
  useEffect(() => {
    if (manualMode) return;

    let isMounted = true;

    const tryInit = () => {
      if (!isMounted || manualModeRef.current) return;
      if (!mapRef.current || !autocompleteContainerRef.current) {
        // DOM refs not ready yet — retry if still mounted & in normal mode
        if (mapRef.current || autocompleteContainerRef.current) {
          setTimeout(tryInit, 50);
        }
        return;
      }
      initializeMap();
    };

    const loadGoogleMaps = () => {
      if (!isMounted || manualModeRef.current) return;

      // Script already present and API ready
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        console.debug("[Location] Google Maps already loaded — initialising.");
        setTimeout(tryInit, 0);
        return;
      }

      // Script tag already injected (concurrent renders) — wait for it
      if (document.getElementById("google-maps-script")) {
        const existing = document.getElementById("google-maps-script");
        existing.addEventListener("load", () => setTimeout(tryInit, 0), { once: true });
        existing.addEventListener("error", () => {
          if (isMounted) setMapError("Unable to load Google Maps.");
        }, { once: true });
        return;
      }

      // Inject script fresh
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=weekly&libraries=maps,marker,places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.debug("[Location] Google Maps script loaded.");
        setTimeout(tryInit, 0);
      };
      script.onerror = () => {
        console.error("[Location] Failed to load Google Maps script.");
        if (isMounted) setMapError("Unable to load Google Maps script.");
      };
    };

    // Small frame delay so React has committed the DOM refs
    setTimeout(loadGoogleMaps, 0);

    return () => {
      isMounted = false;
      // Disconnect theme observer when unmounting map mode
      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
        themeObserverRef.current = null;
      }
    };
  }, [manualMode]);

  /* --------------------------------------------------
     Initialize Map + Modern Autocomplete
  -------------------------------------------------- */
  async function initializeMap() {
    if (!window.google || manualModeRef.current) return;
    if (!mapRef.current || !autocompleteContainerRef.current) {
      console.warn("[Location] initializeMap called before DOM refs ready.");
      return;
    }

    console.debug("[Location] initializeMap start.");

    try {
      // Import required modern libraries
      const { Map } = await window.google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } =
        await window.google.maps.importLibrary("marker");
      await window.google.maps.importLibrary("places");

      if (manualModeRef.current) return;

      const rawLat = Number(formData.latitude);
      const rawLng = Number(formData.longitude);
      const hasValidCoords =
        Number.isFinite(rawLat) &&
        rawLat >= -90 &&
        rawLat <= 90 &&
        Number.isFinite(rawLng) &&
        rawLng >= -180 &&
        rawLng <= 180;

      const center = hasValidCoords
        ? { lat: rawLat, lng: rawLng }
        : DEFAULT_MAP_CENTER;

      const map = new Map(mapRef.current, {
        center,
        zoom: hasValidCoords ? 16 : 5,
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID,
      });

      setMapInstance(map);

      // Modern marker
      const marker = new AdvancedMarkerElement({
        map,
        position: center,
        gmpDraggable: true,
      });

      markerRef.current = marker;

      marker.addListener("dragend", () => {
        if (manualModeRef.current) return;
        const pos = marker.position;
        reverseGeocode(pos.lat, pos.lng);
      });

      /* --------------------------------------------------
         Modern Place Autocomplete
      -------------------------------------------------- */
      const placeAutocomplete =
        new window.google.maps.places.PlaceAutocompleteElement();

      const applyAutocompleteTheme = () => {
        const dark = document.documentElement.classList.contains("dark");

        Object.assign(placeAutocomplete.style, {
          width: "100%",
          display: "block",
          borderRadius: "0.75rem",
          border: dark ? "2px solid #475569" : "2px solid #e2e8f0",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          outline: "none",
          colorScheme: dark ? "dark" : "light",
        });

        placeAutocomplete.style.setProperty(
          "--gmp-material-container-color",
          dark ? "#1e293b" : "#ffffff",
        );
        placeAutocomplete.style.setProperty(
          "--gmp-material-on-container-color",
          dark ? "#f1f5f9" : "#0f172a",
        );
        placeAutocomplete.style.setProperty(
          "--gmp-material-surface-color",
          dark ? "#1e293b" : "#ffffff",
        );
        placeAutocomplete.style.setProperty(
          "--gmp-material-on-surface-color",
          dark ? "#f1f5f9" : "#0f172a",
        );

        try {
          const sr = placeAutocomplete.shadowRoot;
          if (sr) {
            const STYLE_ID = "gmp-custom-theme";
            const prev = sr.getElementById(STYLE_ID);
            if (prev) prev.remove();
            const s = document.createElement("style");
            s.id = STYLE_ID;
            s.textContent = dark
              ? `
                :host { color-scheme: dark; }
                input, .pac-container, [role="listbox"] {
                  background-color: #1e293b !important;
                  color: #f1f5f9 !important;
                  border-color: #475569 !important;
                }
                [role="option"]:hover,
                [role="option"][aria-selected="true"] {
                  background-color: #334155 !important;
                }
                [role="option"] {
                  color: #f1f5f9 !important;
                }
              `
              : `
                :host { color-scheme: light; }
                input { background-color: #ffffff !important; color: #0f172a !important; }
              `;
            sr.appendChild(s);
          }
        } catch (e) {
          console.debug("[Location] Shadow root not accessible — using CSS props only.", e);
        }
      };

      applyAutocompleteTheme();

      const observer = new MutationObserver(applyAutocompleteTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      themeObserverRef.current = observer;

      const container = autocompleteContainerRef.current;
      if (container) {
        container.innerHTML = "";
        container.appendChild(placeAutocomplete);
      }

      placeAutocomplete.addEventListener("gmp-select", async (event) => {
        if (manualModeRef.current) return;
        console.debug("[Location] gmp-select fired.", event);
        const place = event.placePrediction.toPlace();

        await place.fetchFields({
          fields: [
            "displayName",
            "formattedAddress",
            "location",
            "addressComponents",
          ],
        });

        if (manualModeRef.current || !place.location) return;

        const lat = place.location.lat();
        const lng = place.location.lng();

        map.setCenter(place.location);
        map.setZoom(17);
        marker.position = place.location;

        fillForm(place, lat, lng);
      });

      console.debug("[Location] initializeMap complete.");
    } catch (err) {
      console.error("[Location] initializeMap failed:", err);
      setMapError("Failed to initialize Google Maps instance.");
    }
  }

  /* --------------------------------------------------
     Fill Form
  -------------------------------------------------- */
  function fillForm(place, lat, lng) {
    if (manualModeRef.current) return;
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
      latitude: "",
      longitude: "",
    }));
  }

  /* --------------------------------------------------
     Reverse Geocode
  -------------------------------------------------- */
  async function reverseGeocode(lat, lng) {
    if (manualModeRef.current) return;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );

      if (manualModeRef.current) return;
      const data = await res.json();
      const result = data.results?.[0];
      if (!result) return;

      const components = result.address_components || [];
      const get = (t) =>
        components.find((c) => c.types.includes(t))?.long_name || "";

      setFormData((prev) => ({
        ...prev,
        address: result.formatted_address || "",
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
        latitude: "",
        longitude: "",
      }));
    } catch (err) {
      console.error("[Location] reverseGeocode error:", err);
    }
  }

  /* --------------------------------------------------
     Current Location
  -------------------------------------------------- */
  function handleCurrentLocation() {
    if (manualModeRef.current) return;
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        location: "Geolocation is not supported by your browser. Switch to Manual Mode.",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (manualModeRef.current) return;
        const { latitude, longitude } = coords;

        if (mapInstance && markerRef.current) {
          mapInstance.setCenter({ lat: latitude, lng: longitude });
          mapInstance.setZoom(16);
          markerRef.current.position = { lat: latitude, lng: longitude };
        }

        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error("[Location] Geolocation error:", error);
        setErrors((prev) => ({
          ...prev,
          location:
            "Unable to access your current location. You can search for the location or use Manual Mode.",
        }));
      }
    );
  }

  /* --------------------------------------------------
     Manual Mode Input Handlers
  -------------------------------------------------- */
  const handleManualCoordinateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? "" : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleManualAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">
      {/* ── Gradient top accent ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

      {/* ── Subtle inner glow ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-cyan-50/20 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10 pointer-events-none" />

      <div className="relative p-6 sm:p-8 space-y-6">
        {/* ── Header with Manual Mode Toggle ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                Issue Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {manualMode
                  ? "Enter coordinates and address details manually"
                  : "Pin or search the exact location of the issue"}
              </p>
            </div>
          </div>

          {/* Mode Switch Toggle */}
          <div className="flex items-center gap-3 bg-slate-100/90 dark:bg-slate-800/80 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Manual Mode
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {manualMode ? "Manual Coordinates" : "Map-Assisted Mode"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={manualMode}
              onClick={() => setManualMode((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                manualMode ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  manualMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── MANUAL MODE INFO PANEL ── */}
        {manualMode && (
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs space-y-1 animate-in fade-in duration-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <Info size={15} className="flex-shrink-0" />
              Manual Location Entry
            </div>
            <p className="font-medium text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
              Enter the latitude and longitude of the issue directly. You must also provide the address, city, state, and postal code manually.
            </p>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 italic pt-0.5">
              Coordinates will not be automatically validated against Google Maps.
            </p>
          </div>
        )}

        {/* ── NORMAL MODE: SEARCH & MAP ── */}
        {!manualMode && (
          <>
            {/* Map Error Banner */}
            {mapError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Map services are currently unavailable.</span>{" "}
                    You can switch to Manual Mode and enter the location details directly.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManualMode(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs whitespace-nowrap transition-colors"
                >
                  Use Manual Mode
                </button>
              </div>
            )}

            {/* Location Error Banner */}
            {errors?.location && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={15} className="flex-shrink-0 text-red-500" />
                {errors.location}
              </div>
            )}

            {/* Search address block */}
            <div>
              <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                Search Address <span className="text-red-500">*</span>
              </label>

              <div
                ref={autocompleteContainerRef}
                data-tutorial="location-search"
                style={{
                  position: "relative",
                  zIndex: 9999,
                  overflow: "visible",
                  width: "100%",
                }}
              />

              {/* Use Current Location button */}
              <button
                type="button"
                onClick={handleCurrentLocation}
                className="group mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2
                  border-slate-200 dark:border-slate-700
                  bg-white/90 dark:bg-slate-800/80
                  text-slate-700 dark:text-slate-200
                  font-semibold text-sm
                  hover:border-emerald-400 dark:hover:border-emerald-500
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                  hover:text-emerald-700 dark:hover:text-emerald-300
                  hover:shadow-md hover:shadow-emerald-500/10
                  hover:-translate-y-0.5 active:scale-95
                  transition-all duration-200"
                data-tutorial="location-current"
              >
                <Navigation
                  size={16}
                  className="text-emerald-600 dark:text-emerald-400 group-hover:animate-pulse"
                />
                Use Current Location
              </button>
            </div>

            {/* Section divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                Map
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            </div>

            {/* Google Map */}
            <div
              className="relative rounded-2xl overflow-hidden ring-2 ring-emerald-200/60 dark:ring-emerald-700/30 shadow-inner shadow-slate-200 dark:shadow-black/30"
              data-tutorial="location-map"
            >
              <div ref={mapRef} className="w-full h-80" />
            </div>
          </>
        )}

        {/* ── COORDINATES SECTION (Visible in BOTH modes) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Coordinates
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Latitude */}
            <div>
              <label className="block mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide flex items-center justify-between">
                <span>
                  Latitude <span className="text-red-500">*</span>
                </span>
                {!manualMode && (
                  <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Lock size={11} /> Auto-filled
                  </span>
                )}
              </label>
              <input
                type={manualMode ? "number" : "text"}
                step={manualMode ? "any" : undefined}
                readOnly={!manualMode}
                aria-readonly={!manualMode}
                value={formData.latitude ?? ""}
                onChange={(e) => handleManualCoordinateChange("latitude", e.target.value)}
                placeholder={manualMode ? "e.g. 25.3176" : "Auto-filled from map"}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-medium ${
                  errors?.latitude
                    ? "border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 bg-red-50/30 dark:bg-red-900/10 text-red-900 dark:text-red-100"
                    : !manualMode
                    ? "border-slate-200 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-500/10 bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                } placeholder-slate-400 dark:placeholder-slate-500`}
              />
              {errors?.latitude && (
                <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.latitude}
                </div>
              )}
            </div>

            {/* Longitude */}
            <div>
              <label className="block mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide flex items-center justify-between">
                <span>
                  Longitude <span className="text-red-500">*</span>
                </span>
                {!manualMode && (
                  <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Lock size={11} /> Auto-filled
                  </span>
                )}
              </label>
              <input
                type={manualMode ? "number" : "text"}
                step={manualMode ? "any" : undefined}
                readOnly={!manualMode}
                aria-readonly={!manualMode}
                value={formData.longitude ?? ""}
                onChange={(e) => handleManualCoordinateChange("longitude", e.target.value)}
                placeholder={manualMode ? "e.g. 82.9739" : "Auto-filled from map"}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-medium ${
                  errors?.longitude
                    ? "border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 bg-red-50/30 dark:bg-red-900/10 text-red-900 dark:text-red-100"
                    : !manualMode
                    ? "border-slate-200 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-500/10 bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                } placeholder-slate-400 dark:placeholder-slate-500`}
              />
              {errors?.longitude && (
                <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.longitude}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            {manualMode
              ? "Enter valid geographic coordinates (-90 to 90 lat, -180 to 180 lng)."
              : "Automatically updated from the selected map location."}
          </p>
        </div>

        {/* ── ADDRESS DETAILS SECTION ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {manualMode ? "Manual Location Details" : "Address Details"}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["address", "city", "state", "postal"].map((field) => {
              const isAddress = field === "address";
              const isPostal = field === "postal";
              const labelMap = {
                address: "Full Address",
                city: "City",
                state: "State / Region",
                postal: "Postal Code",
              };
              return (
                <div
                  key={field}
                  className={isAddress || isPostal ? "sm:col-span-2" : ""}
                >
                  <label className="block mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide capitalize flex items-center justify-between">
                    <span>
                      {labelMap[field]} <span className="text-red-500">*</span>
                    </span>
                    {!manualMode && (
                      <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Lock size={11} /> Auto-filled
                      </span>
                    )}
                  </label>

                  <input
                    readOnly={!manualMode}
                    aria-readonly={!manualMode}
                    value={formData[field] || ""}
                    onChange={(e) => handleManualAddressChange(field, e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none font-medium ${
                      errors?.[field]
                        ? "border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200/40 dark:focus:ring-red-500/20 bg-red-50/30 dark:bg-red-900/10"
                        : !manualMode
                        ? "border-slate-200 dark:border-slate-700/60 bg-slate-100/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-500/10 bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                    } placeholder-slate-400 dark:placeholder-slate-500`}
                    placeholder={manualMode ? `Enter ${labelMap[field].toLowerCase()}` : labelMap[field]}
                  />

                  {errors?.[field] && (
                    <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {errors[field]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            {manualMode
              ? "Enter the location details exactly as they should be saved."
              : "These details are locked because they are generated from your selected map location. Switch to Manual Mode to edit them directly."}
          </p>
        </div>

        {/* ── MAP LINK SECTION ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Map Link
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">
              Google Maps URL
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({manualMode ? "Generated from coordinates" : "Auto-filled"})
              </span>
            </label>
            <div className="relative">
              <Link2
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                readOnly
                aria-readonly="true"
                value={formData.googleMapUrl || ""}
                placeholder="https://www.google.com/maps?q=..."
                className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700/60 outline-none transition-all bg-slate-100/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              {manualMode
                ? "Generated automatically from the entered latitude and longitude."
                : "Auto-populated when you select a location on the map."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
