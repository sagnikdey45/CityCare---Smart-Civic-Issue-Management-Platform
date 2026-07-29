"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { GoogleMap, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { AlertTriangle, Brain, RefreshCw } from "lucide-react";
import { useGoogleMapsStatus } from "./GoogleMapsProvider";

const CITY_CENTERS = {
  varanasi: { lat: 25.3176, lng: 82.9739 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  prayagraj: { lat: 25.4358, lng: 81.8463 },
};

const CATEGORY_MARKER_COLORS = {
  road: "#f97316",
  electricity: "#eab308",
  water: "#0ea5e9",
  sanitation: "#10b981",
  drainage: "#14b8a6",
  solid_waste: "#84cc16",
  public_health: "#ef4444",
  other: "#64748b",
};

const getCategoryKey = (cat) => {
  return String(cat || "other")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
};

const getDeterministicOffsetPosition = (issue, index, allIssues) => {
  const lat = Number(issue.latitude);
  const lng = Number(issue.longitude);

  let matchCount = 0;
  for (let i = 0; i < index; i++) {
    if (
      Math.abs(Number(allIssues[i].latitude) - lat) < 0.0001 &&
      Math.abs(Number(allIssues[i].longitude) - lng) < 0.0001
    ) {
      matchCount++;
    }
  }

  if (matchCount === 0) return { lat, lng };

  const angle = matchCount * 0.5;
  const distance = 0.00015 * matchCount;
  const offsetLat = lat + Math.sin(angle) * distance;
  const offsetLng = lng + Math.cos(angle) * distance;

  return { lat: offsetLat, lng: offsetLng };
};

function formatCategoryLabel(value) {
  return String(value || "Other")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createCategoryPinSvg(colour) {
  const safeColour = colour || CATEGORY_MARKER_COLORS.other;

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="34"
      height="44"
      viewBox="0 0 34 44"
    >
      <defs>
        <filter
          id="pinShadow"
          x="-40%"
          y="-30%"
          width="180%"
          height="190%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            flood-color="#000000"
            flood-opacity="0.28"
          />
        </filter>
      </defs>

      <path
        filter="url(#pinShadow)"
        d="M17 1.5C8.45 1.5 1.5 8.45 1.5 17
           C1.5 28.3 17 42 17 42
           C17 42 32.5 28.3 32.5 17
           C32.5 8.45 25.55 1.5 17 1.5Z"
        fill="${safeColour}"
        stroke="#ffffff"
        stroke-width="2"
      />

      <circle
        cx="17"
        cy="17"
        r="6"
        fill="#ffffff"
      />

      <circle
        cx="17"
        cy="17"
        r="2.5"
        fill="${safeColour}"
      />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function CityIssueMap({
  city,
  state,
  mapIssues,
  categoryFilter,
  onCategoryFilterChange,
  onViewIssue,
}) {
  const { isLoaded, loadError, hasApiKey } = useGoogleMapsStatus();
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [selectedMapIssue, setSelectedMapIssue] = useState(null);
  const mapRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // 1. Coordinate validation & normalization
  const validMapIssues = useMemo(() => {
    return (mapIssues ?? [])
      .map((issue) => {
        const id = String(issue.id ?? issue._id ?? "");
        const latitude = Number(issue.latitude);
        const longitude = Number(issue.longitude);

        return {
          ...issue,
          id,
          latitude,
          longitude,
        };
      })
      .filter(
        (issue) =>
          issue.id &&
          Number.isFinite(issue.latitude) &&
          Number.isFinite(issue.longitude) &&
          issue.latitude >= -90 &&
          issue.latitude <= 90 &&
          issue.longitude >= -180 &&
          issue.longitude <= 180,
      );
  }, [mapIssues]);

  // 2. Client category filtering
  const visibleMapIssues = useMemo(() => {
    if (categoryFilter === "all") {
      return validMapIssues;
    }

    return validMapIssues.filter((issue) => {
      const categoryKey = getCategoryKey(issue.category);
      return categoryKey === categoryFilter;
    });
  }, [validMapIssues, categoryFilter]);

  // 3. Precompute positioned markers
  const positionedMapIssues = useMemo(() => {
    return visibleMapIssues.map((issue, index, issues) => ({
      ...issue,
      markerPosition: getDeterministicOffsetPosition(issue, index, issues),
    }));
  }, [visibleMapIssues]);

  // 4. Map Center Bounding
  const mapCenter = useMemo(() => {
    const cityKey = String(city || "")
      .toLowerCase()
      .trim();

    if (CITY_CENTERS[cityKey]) {
      return CITY_CENTERS[cityKey];
    }

    const firstIssue = validMapIssues[0];
    if (firstIssue) {
      return {
        lat: firstIssue.latitude,
        lng: firstIssue.longitude,
      };
    }

    return CITY_CENTERS.varanasi;
  }, [city, validMapIssues]);

  // 5. Caching Marker Icons
  const categoryPinIcons = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(CATEGORY_MARKER_COLORS).map(([category, colour]) => [
        category,
        {
          url: createCategoryPinSvg(colour),
          scaledSize: new window.google.maps.Size(34, 44),
          size: new window.google.maps.Size(34, 44),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(17, 42),
          labelOrigin: new window.google.maps.Point(17, 16),
        },
      ]),
    );
  }, [isLoaded]);

  const categoryHoverPinIcons = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(CATEGORY_MARKER_COLORS).map(([category, colour]) => [
        category,
        {
          url: createCategoryPinSvg(colour),
          scaledSize: new window.google.maps.Size(40, 52),
          size: new window.google.maps.Size(34, 44),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(20, 50),
        },
      ]),
    );
  }, [isLoaded]);

  // 6. Hover & Selection Sync effects
  useEffect(() => {
    if (
      selectedMapIssue &&
      !positionedMapIssues.some((issue) => issue.id === selectedMapIssue.id)
    ) {
      setSelectedMapIssue(null);
    }
    if (
      hoveredIssue &&
      !positionedMapIssues.some((issue) => issue.id === hoveredIssue.id)
    ) {
      setHoveredIssue(null);
    }
  }, [positionedMapIssues, selectedMapIssue, hoveredIssue]);

  const handleMarkerMouseOver = useCallback(
    (issue) => {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = window.setTimeout(() => {
        if (selectedMapIssue?.id !== issue.id) {
          setHoveredIssue(issue);
        }
      }, 150);
    },
    [selectedMapIssue],
  );

  const handleMarkerMouseOut = useCallback(() => {
    window.clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredIssue(null);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // 7. Prevent indexOf checks for InfoWindows
  const hoveredPositionedIssue = useMemo(
    () =>
      positionedMapIssues.find((issue) => issue.id === hoveredIssue?.id) ??
      null,
    [positionedMapIssues, hoveredIssue?.id],
  );

  const selectedPositionedIssue = useMemo(
    () =>
      positionedMapIssues.find((issue) => issue.id === selectedMapIssue?.id) ??
      null,
    [positionedMapIssues, selectedMapIssue?.id],
  );

  // 8. Viewport Auto Bounding Fit bounds
  useEffect(() => {
    const mapInstance = mapRef.current;

    if (
      !mapInstance ||
      !isLoaded ||
      typeof window === "undefined" ||
      !window.google?.maps
    ) {
      return;
    }

    if (positionedMapIssues.length === 0) {
      mapInstance.setCenter(mapCenter);
      mapInstance.setZoom(12);
      return;
    }

    if (positionedMapIssues.length === 1) {
      mapInstance.setCenter(positionedMapIssues[0].markerPosition);
      mapInstance.setZoom(15);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    positionedMapIssues.forEach((issue) => {
      bounds.extend(issue.markerPosition);
    });

    mapInstance.fitBounds(bounds, 48);

    const timeoutId = window.setTimeout(() => {
      const zoom = mapInstance.getZoom();
      if (typeof zoom === "number" && zoom > 16) {
        mapInstance.setZoom(16);
      }
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoaded, positionedMapIssues, mapCenter]);

  // 9. Legend definition
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const issue of positionedMapIssues) {
      const key = getCategoryKey(issue.category);
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([key, count]) => {
        const label = key.replace(/_/g, " ");
        const color =
          CATEGORY_MARKER_COLORS[key] || CATEGORY_MARKER_COLORS.other;
        return { key, label, count, color };
      })
      .sort((a, b) => b.count - a.count);
  }, [positionedMapIssues]);

  // 10. Empty state checks
  const hasNoMarkers = positionedMapIssues.length === 0;
  const hasNoIssuesInPeriod = (mapIssues || []).length === 0;
  const hasIssuesButNoValidCoordinates =
    (mapIssues || []).length > 0 && validMapIssues.length === 0;
  const hasNoIssuesForSelectedCategory =
    validMapIssues.length > 0 &&
    visibleMapIssues.length === 0 &&
    categoryFilter !== "all";

  const invalidCoordsCount = (mapIssues || []).length - validMapIssues.length;

  if (process.env.NODE_ENV === "development") {
    console.debug("[CityAdminOverview map]", {
      totalMapIssues: (mapIssues || []).length,
      validMapIssues: validMapIssues.length,
      visibleMapIssues: positionedMapIssues.length,
      city,
      isLoaded,
      hasApiKey,
      loadError,
    });
  }

  const handleReviewIssue = useCallback(
    (issue) => {
      onViewIssue({
        ...issue,
        id: issue.id || issue._id,
        ticket_id: issue.code || issue.ticket_id || issue.issueCode,
      });
    },
    [onViewIssue],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              City Issue Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              All reported issue locations in {city}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-4 py-2 text-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm"
          >
            <option value="all">All Categories</option>
            <option value="road">Road</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="sanitation">Sanitation</option>
            <option value="drainage">Drainage</option>
            <option value="solid_waste">Solid Waste</option>
            <option value="public_health">Public Health</option>
            <option value="other">Other</option>
          </select>

          <button
            disabled
            title="Ward boundary spatial data is currently unavailable for this region."
            className="px-4 py-2 text-sm rounded-xl font-semibold bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700 cursor-not-allowed shadow-sm"
          >
            Ward Boundaries (N/A)
          </button>
        </div>

        <div className="relative h-[420px] md:h-[520px] bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl mb-6 overflow-hidden border border-slate-200 dark:border-slate-700">
          {!hasApiKey ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/10 p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
              <h3 className="font-extrabold text-slate-905">
                Maps API Key Missing
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Google Maps API key is not configured. Add
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and restart the Next.js
                development server.
              </p>
            </div>
          ) : loadError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/10 p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
              <h3 className="font-extrabold text-slate-905">
                Google Maps Failed to Load
              </h3>
              <p className="text-xs text-slate-550 max-w-sm mt-1">
                Please verify your environment settings or network connection.
              </p>
            </div>
          ) : !isLoaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                Initializing Map Preview...
              </p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={12}
              onLoad={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
              onUnmount={() => {
                mapRef.current = null;
              }}
              options={MAP_OPTIONS}
            >
              {positionedMapIssues.map((issue) => {
                const colorKey = getCategoryKey(issue.category);
                const isHighlighted =
                  hoveredIssue?.id === issue.id ||
                  selectedMapIssue?.id === issue.id;

                const markerIcon = isHighlighted
                  ? (categoryHoverPinIcons[colorKey] ??
                    categoryHoverPinIcons.other)
                  : (categoryPinIcons[colorKey] ?? categoryPinIcons.other);

                return (
                  <MarkerF
                    key={issue.id}
                    position={issue.markerPosition}
                    title={`${issue.code} — ${issue.title}`}
                    icon={markerIcon || undefined}
                    zIndex={
                      selectedMapIssue?.id === issue.id
                        ? 3000
                        : hoveredIssue?.id === issue.id
                          ? 2000
                          : 1000
                    }
                    onClick={() => {
                      setHoveredIssue(null);
                      setSelectedMapIssue(issue);
                    }}
                    onMouseOver={() => handleMarkerMouseOver(issue)}
                    onMouseOut={handleMarkerMouseOut}
                  />
                );
              })}

              {/* Hover Tooltip Info Window */}
              {hoveredPositionedIssue && (
                <InfoWindowF
                  position={hoveredPositionedIssue.markerPosition}
                  options={{
                    disableAutoPan: true,
                    closeButton: false,
                    pixelOffset: new window.google.maps.Size(0, -44),
                  }}
                >
                  <div className="hover-tooltip-container pointer-events-none select-none p-2 text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-xs space-y-1">
                    <p className="font-extrabold text-cyan-600 dark:text-cyan-400">
                      {hoveredPositionedIssue.code}
                    </p>
                    <p className="font-bold truncate text-slate-905">
                      {hoveredPositionedIssue.title}
                    </p>
                    <p className="text-[10px] text-slate-550 capitalize">
                      {hoveredPositionedIssue.category} •{" "}
                      {hoveredPositionedIssue.status}
                    </p>
                    <p className="text-[10px] text-slate-550 capitalize">
                      {hoveredPositionedIssue.priority} Priority
                    </p>
                    <p className="text-[10px] text-slate-550 truncate">
                      {hoveredPositionedIssue.address}
                    </p>
                  </div>
                </InfoWindowF>
              )}

              {/* Click Persistent Info Window */}
              {selectedPositionedIssue && (
                <InfoWindowF
                  position={selectedPositionedIssue.markerPosition}
                  onCloseClick={() => setSelectedMapIssue(null)}
                >
                  <div className="p-3 text-xs text-slate-800 dark:text-slate-100 max-w-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-extrabold text-cyan-650 dark:text-cyan-400">
                        {selectedPositionedIssue.code}
                      </span>
                      <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                        {selectedPositionedIssue.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-905">
                        {selectedPositionedIssue.title}
                      </h4>
                      <p className="text-[11px] text-slate-550 mt-1 line-clamp-2">
                        {selectedPositionedIssue.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-100 pt-1.5 text-slate-500">
                      <div>
                        <span className="block font-black text-slate-400">
                          Category
                        </span>
                        <span className="capitalize text-slate-800">
                          {selectedPositionedIssue.category}
                        </span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-400">
                          Priority
                        </span>
                        <span className="capitalize text-slate-800">
                          {selectedPositionedIssue.priority}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="block font-black text-slate-400">
                          Address
                        </span>
                        <span className="truncate block text-slate-800">
                          {selectedPositionedIssue.address}
                        </span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-400">
                          SLA Status
                        </span>
                        <span
                          className={`capitalize font-bold ${
                            selectedPositionedIssue.slaStatus === "breached"
                              ? "text-red-500"
                              : selectedPositionedIssue.slaStatus === "at_risk"
                                ? "text-amber-500"
                                : "text-emerald-500"
                          }`}
                        >
                          {selectedPositionedIssue.slaStatus}
                        </span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-400">
                          Time Status
                        </span>
                        <span className="text-slate-800">
                          {selectedPositionedIssue.hoursRemaining < 0
                            ? `${Math.abs(selectedPositionedIssue.hoursRemaining)}h overdue`
                            : `${selectedPositionedIssue.hoursRemaining}h remaining`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReviewIssue(selectedPositionedIssue)}
                      className="w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition-colors mt-2"
                    >
                      View Issue Details
                    </button>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          )}

          {/* Mapped issues count label overlay */}
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-850/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
              {positionedMapIssues.length}{" "}
              {positionedMapIssues.length === 1 ? "Issue" : "Issues"} Mapped
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
              {city}, {state}
            </p>
            {invalidCoordsCount > 0 && categoryFilter === "all" && (
              <p className="text-[9px] text-red-500 font-bold mt-1 max-w-[200px]">
                {invalidCoordsCount}{" "}
                {invalidCoordsCount === 1 ? "issue doesn't" : "issues do not"}{" "}
                have valid location coordinates
              </p>
            )}
          </div>

          {/* Map empty state overlay */}
          {isLoaded && hasNoMarkers && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-10 pointer-events-none">
              <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />

              <h3 className="font-extrabold text-lg text-white">
                {hasNoIssuesForSelectedCategory
                  ? `No ${formatCategoryLabel(categoryFilter)} Issues Found`
                  : "No Mappable Issues Found"}
              </h3>

              <p className="text-sm text-white/80 mt-1 max-w-sm">
                {hasNoIssuesInPeriod
                  ? "No issues were reported during the selected period."
                  : hasIssuesButNoValidCoordinates
                    ? "Issues exist for this period, but none contain valid map coordinates."
                    : hasNoIssuesForSelectedCategory
                      ? `No ${formatCategoryLabel(
                          categoryFilter,
                        )} issues have valid coordinates for this period.`
                      : "No issues are currently available for the selected filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Breakdown / Legend list */}
      <div className="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl blur opacity-40"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Issue Categories
            </h2>
            <p className="text-xs text-slate-505 dark:text-slate-400 font-semibold mt-0.5">
              Breakdown of {positionedMapIssues.length} visible map issues
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
          {categoryCounts.map((item) => (
            <div
              key={item.key}
              className="group/item p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="relative inline-flex h-5 w-4 flex-shrink-0 items-start justify-center"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute top-0 h-4 w-4 rotate-45 rounded-full rounded-br-none border border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="absolute top-[5px] h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {item.count} {item.count === 1 ? "issue" : "issues"}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(item.count / (positionedMapIssues.length || 1)) * 100}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
          {categoryCounts.length === 0 && (
            <div className="text-center py-20 text-xs font-bold text-slate-400">
              No category data represented on the map
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(CityIssueMap);
