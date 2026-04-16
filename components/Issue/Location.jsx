"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Link2, AlertCircle } from "lucide-react";

export default function Location({ formData, setFormData, errors, setErrors }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteContainerRef = useRef(null);
  const themeObserverRef = useRef(null); // cleans up MutationObserver on unmount
  const [mapInstance, setMapInstance] = useState(null);

  /* --------------------------------------------------
     Load Google Maps Script (ONLY ONCE)
  -------------------------------------------------- */
  useEffect(() => {
    let isMounted = true;

    const tryInit = () => {
      if (!isMounted) return;
      if (!mapRef.current || !autocompleteContainerRef.current) {
        // DOM refs not ready yet — retry once
        setTimeout(tryInit, 50);
        return;
      }
      initializeMap();
    };

    const loadGoogleMaps = () => {
      if (!isMounted) return;

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
      };
    };

    // Small frame delay so React has committed the DOM refs
    setTimeout(loadGoogleMaps, 0);

    return () => {
      isMounted = false;
      // Disconnect theme observer when component unmounts
      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
        themeObserverRef.current = null;
      }
    };
  }, []);

  /* --------------------------------------------------
     Initialize Map + Modern Autocomplete
  -------------------------------------------------- */
  async function initializeMap() {
    if (!window.google) return;
    if (!mapRef.current || !autocompleteContainerRef.current) {
      console.warn("[Location] initializeMap called before DOM refs ready.");
      return;
    }

    console.debug("[Location] initializeMap start.");

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
       ⚠️  PlaceAutocompleteElement uses Shadow DOM.
           - classList.add() only affects the host element, NOT shadow internals.
           - The dropdown is rendered OUTSIDE the component's shadow root, appended
             to <body> by the Maps SDK — so the parent MUST NOT have overflow:hidden.
           - We use CSS custom properties + shadow root style injection for theming.
    -------------------------------------------------- */
    const placeAutocomplete =
      new window.google.maps.places.PlaceAutocompleteElement();

    // ── Theme helper — runs on init and on every dark/light toggle ────────────
    const applyAutocompleteTheme = () => {
      const dark = document.documentElement.classList.contains("dark");

      // 1. Structural / layout styles (always applied)
      Object.assign(placeAutocomplete.style, {
        width: "100%",
        display: "block",
        borderRadius: "0.75rem",
        border: dark ? "2px solid #475569" : "2px solid #e2e8f0",
        fontSize: "0.875rem",
        lineHeight: "1.5",
        outline: "none",
        // Tells the browser to render shadow-DOM form controls in dark/light mode
        colorScheme: dark ? "dark" : "light",
      });

      // 2. CSS custom properties — Maps SDK material design tokens
      placeAutocomplete.style.setProperty(
        "--gmp-material-container-color",
        dark ? "#1e293b" : "#ffffff",           // slate-800 | white
      );
      placeAutocomplete.style.setProperty(
        "--gmp-material-on-container-color",
        dark ? "#f1f5f9" : "#0f172a",           // slate-100 | slate-900
      );
      placeAutocomplete.style.setProperty(
        "--gmp-material-surface-color",
        dark ? "#1e293b" : "#ffffff",
      );
      placeAutocomplete.style.setProperty(
        "--gmp-material-on-surface-color",
        dark ? "#f1f5f9" : "#0f172a",
      );

      // 3. Shadow-root style injection — deepest level, catches any stragglers
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
        // Shadow root is closed on some browsers — CSS custom properties above still apply
        console.debug("[Location] Shadow root not accessible — using CSS props only.", e);
      }
    };

    // Apply theme immediately
    applyAutocompleteTheme();

    // Watch for dark/light class changes on <html> (next-themes, manual toggles)
    const observer = new MutationObserver(applyAutocompleteTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    themeObserverRef.current = observer;

    // Prevent duplicate rendering
    const container = autocompleteContainerRef.current;
    container.innerHTML = "";
    container.appendChild(placeAutocomplete);

    console.debug("[Location] PlaceAutocompleteElement mounted.");

    placeAutocomplete.addEventListener("gmp-select", async (event) => {
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

      if (!place.location) return;

      const lat = place.location.lat();
      const lng = place.location.lng();

      map.setCenter(place.location);
      map.setZoom(17);
      marker.position = place.location;

      fillForm(place, lat, lng);
    });

    console.debug("[Location] initializeMap complete.");
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

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">
      {/* ── Gradient top accent ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

      {/* ── Subtle inner glow ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-cyan-50/20 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10 pointer-events-none" />

      <div className="relative p-6 sm:p-8 space-y-6">
        {/* ── Heading ── */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              Issue Location
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pin or search the exact location of the issue
            </p>
          </div>
        </div>

        {/* ── Search address block ── */}
        <div>
          <label className="block mb-2 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">
            Search Address <span className="text-red-500">*</span>
          </label>

          {/* Google Places Autocomplete mounts here.
              CRITICAL:
              - position:relative + z-index:9999 so the dropdown panel
                (which Maps SDK appends to <body>/<document>) stays on top.
              - overflow:visible — NEVER overflow:hidden here or the
                dropdown panel rendered outside the shadow root gets clipped.
          */}
          <div
            ref={autocompleteContainerRef}
            data-tutorial="location-search"
            // className={`transition-all ${errors?.address ? "ring-2 ring-red-300 dark:ring-red-500/50 rounded-xl" : ""}`}
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

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Map
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Google Map ── */}
        <div className="relative rounded-2xl overflow-hidden ring-2 ring-emerald-200/60 dark:ring-emerald-700/30 shadow-inner shadow-slate-200 dark:shadow-black/30" data-tutorial="location-map">
          <div ref={mapRef} className="w-full h-80" />
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Address Details
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Address grid ── */}
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
                <label className="block mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide capitalize">
                  {labelMap[field]} <span className="text-red-500">*</span>
                </label>

                <input
                  value={formData[field] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                    errors?.[field]
                      ? "border-red-300 dark:border-red-500/50 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-200/40 dark:focus:ring-red-500/20 bg-red-50/30 dark:bg-red-900/10"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-500/10 bg-white/90 dark:bg-slate-800/80"
                  } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                  placeholder={labelMap[field]}
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

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            Map Link
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Google Maps URL ── */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">
            Google Maps URL
            <span className="ml-2 text-xs font-normal text-slate-400">
              (Auto-filled)
            </span>
          </label>
          <div className="relative">
            <Link2
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <input
              value={formData.googleMapUrl || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  googleMapUrl: e.target.value,
                }))
              }
              placeholder="https://maps.google.com/..."
              className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 outline-none transition-all bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            Auto-populated when you select a location on the map
          </p>
        </div>
      </div>
    </div>
  );
}
