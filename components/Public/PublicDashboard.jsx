import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Moon,
  Sun,
  Home,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Calendar,
  Filter,
  X,
  Share2,
  Eye,
  ChevronRight,
  BarChart3,
  Award,
  Target,
  Zap,
  Image as ImageIcon,
  ChevronLeft,
  ChevronDown,
  Map as MapIcon,
  Layers,
  Grid3x3,
} from "lucide-react";
import { PublicNavbar } from "./PublicNavbar";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  HeatmapLayer,
} from "@react-google-maps/api";
import IssueDiscussionForum from "./IssueDiscussionForum";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PublicDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mapView, setMapView] = useState("pins");
  const [showToast, setShowToast] = useState(false);
  const [center, setCenter] = useState(null);

  const libraries = ["visualization"];

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [cityName, setCityName] = useState("Loading...");

  const citizenCityQuery = useQuery(
    api.issues.getCitizenCityByUserId,
    session?.user?.id ? { userId: session.user.id } : "skip"
  );

  const publicIssues = useQuery(
    api.publicIssues.getCityPublicIssues,
    cityName !== "Loading..." ? { city: cityName } : "skip"
  );

  useEffect(() => {
    let active = true;

    if (session?.user?.id) {
      if (citizenCityQuery?.city) {
        setCityName(citizenCityQuery.city);
      } else if (citizenCityQuery === null) {
        setCityName("Varanasi");
      }
    } else if (status !== "loading") {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (!active) return;
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
              );
              const data = await res.json();

              let foundCity = "Varanasi";
              if (data.results && data.results.length > 0) {
                for (let component of data.results[0].address_components) {
                  if (component.types.includes("locality")) {
                    foundCity = component.long_name;
                    break;
                  }
                }
              }
              if (active) setCityName(foundCity);
            } catch (err) {
              console.error("Reverse geocoding failed", err);
              if (active) setCityName("Varanasi");
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            if (active) setCityName("Varanasi");
          }
        );
      } else {
        setCityName("Varanasi");
      }
    }

    return () => {
      active = false;
    };
  }, [session, status, citizenCityQuery]);

  useEffect(() => {
    if (cityName === "Loading...") return;

    const geocodeCity = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${cityName}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        );

        const data = await response.json();

        if (data.results.length > 0) {
          const location = data.results[0].geometry.location;

          setCenter({
            lat: location.lat,
            lng: location.lng,
          });
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
      }
    };

    geocodeCity();
  }, [cityName]);

  const idFromUrl = searchParams.get("id");
  const cityFromUrl = searchParams.get("city");

  const urlSpecificIssue = useQuery(
    api.publicIssues.getCityPublicIssueByIssueCode,
    (cityFromUrl || cityName !== "Loading...") && idFromUrl
      ? { city: cityFromUrl || cityName, issueCode: idFromUrl }
      : "skip"
  );

  useEffect(() => {
    if (idFromUrl) {
      if (urlSpecificIssue) {
        setSelectedIssue(urlSpecificIssue);
      } else {
        const foundIssue = (publicIssues || []).find(
          (issue) => issue.issueCode === idFromUrl
        );
        if (foundIssue) {
          setSelectedIssue(foundIssue);
        }
      }
    } else {
      setSelectedIssue(null);
    }
  }, [idFromUrl, urlSpecificIssue, publicIssues]);

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    let filtered = (publicIssues || []).filter(issue => issue.publishStatus === "published");

    // Only show resolved/rejected
    filtered = filtered.filter(
      (issue) => issue.status === "resolved" || issue.status === "rejected",
    );

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (issue) =>
          issue.issueCode.toLowerCase().includes(term) ||
          issue.title.toLowerCase().includes(term) ||
          issue.address.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    // Ward filter
    if (wardFilter !== "all") {
      filtered = filtered.filter((issue) => issue.ward === wardFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "rating") {
        return (b.citizenRating || 0) - (a.citizenRating || 0);
      } else {
        return (
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, categoryFilter, wardFilter, sortBy, publicIssues]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const resolved = (publicIssues || []).filter((i) => i.status === "resolved" && i.publishStatus === "published");
    const rejected = (publicIssues || []).filter((i) => i.status === "rejected" && i.publishStatus === "published");

    const avgResolutionTime =
      resolved.reduce((acc, issue) => {
        const start = new Date(issue.createdAt).getTime();
        const end = new Date(issue.resolvedAt).getTime();
        const days = (end - start) / (1000 * 60 * 60 * 24);
        return acc + days;
      }, 0) / resolved.length;

    const avgRating =
      resolved.reduce((acc, issue) => acc + (issue.citizenRating || 0), 0) /
      resolved.length;

    return {
      totalResolved: resolved.length,
      totalRejected: rejected.length,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      avgRating: avgRating.toFixed(1),
    };
  }, [publicIssues]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setWardFilter("all");
    setSortBy("newest");
  };

  const handleShare = (issueCode, issueCity) => {
    const url = `${window.location.origin}/public-dashboard?id=${issueCode}&city=${encodeURIComponent(issueCity)}`;

    navigator.clipboard.writeText(url);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeselect = () => {
    setSelectedIssue(null);
    router.push(`/public-dashboard`, { scroll: false });
  };

  const categoryLabels = {
    road: "Road & Infrastructure",
    lighting: "Street Lighting",
    waste: "Waste Management",
    water: "Water Supply",
    other: "Other",
  };

  return (
    <div className={`min-h-screen`}>
      <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen transition-colors duration-300">
        {/* Top Navbar */}
        <PublicNavbar />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 dark:from-teal-400 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3">
              CityCare Public Transparency Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Track resolved and reviewed civic issues across {cityName === "Loading..." ? "your city" : cityName}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-500 dark:bg-emerald-600 p-3 rounded-xl">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded">
                  +12%
                </span>
              </div>
              <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1">
                Total Resolved
              </p>
              <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-300">
                {kpis.totalResolved}
              </p>
            </div>

            <div className="group bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-500 dark:bg-red-600 p-3 rounded-xl">
                  <XCircle className="text-white" size={24} />
                </div>
                <span className="text-red-600 dark:text-red-400 text-sm font-semibold bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded">
                  -3%
                </span>
              </div>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium mb-1">
                Total Rejected
              </p>
              <p className="text-4xl font-bold text-red-900 dark:text-red-300">
                {kpis.totalRejected}
              </p>
            </div>

            <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 border-2 border-cyan-200 dark:border-cyan-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-cyan-500 dark:bg-cyan-600 p-3 rounded-xl">
                  <Clock className="text-white" size={24} />
                </div>
                <span className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold bg-cyan-100 dark:bg-cyan-900/40 px-2 py-1 rounded">
                  -8%
                </span>
              </div>
              <p className="text-cyan-700 dark:text-cyan-400 text-sm font-medium mb-1">
                Avg Resolution Time
              </p>
              <p className="text-4xl font-bold text-cyan-900 dark:text-cyan-300">
                {kpis.avgResolutionTime}
                <span className="text-lg ml-1">days</span>
              </p>
            </div>

            <div className="group bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-500 dark:bg-amber-600 p-3 rounded-xl">
                  <Star className="text-white" size={24} />
                </div>
                <span className="text-amber-600 dark:text-amber-400 text-sm font-semibold bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">
                  +5%
                </span>
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-1">
                Avg Citizen Rating
              </p>
              <p className="text-4xl font-bold text-amber-900 dark:text-amber-300">
                {kpis.avgRating}
                <span className="text-lg ml-1">/5</span>
              </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapIcon
                  className="text-teal-600 dark:text-teal-400"
                  size={24}
                />
                Issue Distribution Map
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => setMapView("heatmap")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    mapView === "heatmap"
                      ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Heatmap
                </button>

                <button
                  onClick={() => setMapView("pins")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    mapView === "pins"
                      ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  Pins
                </button>
              </div>
            </div>

            {!isLoaded || !center ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Loading Map...</p>
              </div>
            ) : (
              <GoogleMap
                key={mapView}
                zoom={13}
                center={center}
                mapContainerStyle={mapContainerStyle}
                options={{
                  styles: [
                    {
                      featureType: "poi",
                      stylers: [{ visibility: "off" }],
                    },
                  ],
                }}
              >
                {/* 🔴 Heatmap */}
                {mapView === "heatmap" && (
                  <HeatmapLayer
                    data={filteredIssues.map(
                      (issue) =>
                        new window.google.maps.LatLng(
                          issue.latitude,
                          issue.longitude,
                        ),
                    )}
                    options={{
                      radius: 40,
                      opacity: 0.7,
                    }}
                  />
                )}

                {/* 📍 Pins */}
                {mapView === "pins" &&
                  filteredIssues.map((issue) => (
                    <Marker
                      key={issue.id}
                      position={{
                        lat: issue.latitude,
                        lng: issue.longitude,
                      }}
                      icon={{
                        url:
                          issue.status === "resolved"
                            ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                            : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      }}
                      onClick={() => {
                        setSelectedIssue(issue);
                        router.push(`/public-dashboard?id=${issue.issueCode}`, {
                          scroll: false,
                        });
                      }}
                    />
                  ))}
              </GoogleMap>
            )}

            {/* Legend */}
            <div className="mt-4 flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Resolved
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Rejected
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 mb-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by issue code, title, or area..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-teal-500 dark:focus:border-teal-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all text-lg"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Filter size={18} />
                <span className="font-semibold text-sm">Filters:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
              >
                <option value="all">All Status</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
              >
                <option value="all">All Categories</option>
                <option value="road">Road & Infrastructure</option>
                <option value="lighting">Street Lighting</option>
                <option value="waste">Waste Management</option>
                <option value="water">Water Supply</option>
                <option value="other">Other</option>
              </select>

              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
              >
                <option value="all">All Wards</option>
                <option value="Lanka">Lanka</option>
                <option value="Assi">Assi</option>
                <option value="Sigra">Sigra</option>
                <option value="Maldahiya">Maldahiya</option>
                <option value="Dashashwamedh">Dashashwamedh</option>
                <option value="Cantt">Cantt</option>
                <option value="Luxa">Luxa</option>
                <option value="Ravindrapuri">Ravindrapuri</option>
                <option value="Chowk">Chowk</option>
                <option value="Pandeypur">Pandeypur</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </select>

              {(searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all" ||
                wardFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                >
                  <X size={16} />
                  Clear
                </button>
              )}

              <div className="ml-auto flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                {selectedIssue && (
                  <button
                    onClick={handleDeselect}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                  >
                    <X size={14} />
                    Deselect Issue
                  </button>
                )}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredIssues.length}
                </span>{" "}
                issues found
              </div>
            </div>
          </div>

          {/* Main Content - Two Column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Issue List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredIssues.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center">
                  <Search
                    className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                    size={64}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Issues Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No issues match your current filters. Try adjusting your
                    search criteria.
                  </p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setSelectedIssue(issue);
                      router.push(`/public-dashboard?id=${issue.issueCode}`, {
                        scroll: false,
                      });
                    }}
                    className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 transition-all cursor-pointer hover:shadow-xl transform hover:-translate-y-1 ${
                      selectedIssue?.id === issue.id
                        ? "border-teal-500 dark:border-teal-400"
                        : "border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              issue.status === "resolved"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}
                          >
                            {issue.status === "resolved" ? (
                              <CheckCircle className="inline mr-1" size={12} />
                            ) : (
                              <XCircle className="inline mr-1" size={12} />
                            )}
                            {issue.status.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg font-bold">
                            {issue.issueCode}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400">
                            {categoryLabels[issue.category]}
                          </span>
                        </div>
                        {issue.status === "resolved" && issue.citizenRating && (
                          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-lg">
                            <Star
                              className="text-amber-500"
                              size={14}
                              fill="currentColor"
                            />
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                              {issue.citizenRating}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {issue.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin
                            size={14}
                            className="text-teal-600 dark:text-teal-400"
                          />
                          <span>{issue.ward}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar
                            size={14}
                            className="text-teal-600 dark:text-teal-400"
                          />
                          <span>
                            {format(new Date(issue.createdAt), "PPP")}
                          </span>
                        </div>
                      </div>

                      {issue.status === "resolved" &&
                        (issue.photosBefore.length > 0 ||
                          issue.photosAfter.length > 0) && (
                          <div className="flex items-center gap-2 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-3 py-2 rounded-lg">
                            <ImageIcon size={14} />
                            <span className="font-semibold">
                              Before/After Evidence Available
                            </span>
                          </div>
                        )}

                      {issue.status === "rejected" && issue.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-3 rounded">
                          <p className="text-xs text-red-700 dark:text-red-400 line-clamp-2">
                            <span className="font-semibold">Reason:</span>{" "}
                            {issue.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column - Detail Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-36">
                {selectedIssue ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div
                      className={`p-6 ${
                        selectedIssue.status === "resolved"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                          : "bg-gradient-to-r from-red-500 to-orange-600"
                      }`}
                    >
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {selectedIssue.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                          {selectedIssue.issueCode}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                          {selectedIssue.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 max-h-[600px] overflow-y-auto">
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase">
                          Description
                        </h4>
                        <p className="text-gray-900 dark:text-white leading-relaxed">
                          {selectedIssue.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">
                          Location
                        </h4>
                        <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin
                              className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-1"
                              size={16}
                            />
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {selectedIssue.address}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedIssue.ward} Ward, {selectedIssue.city}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-1">
                                {selectedIssue.latitude.toFixed(4)},{" "}
                                {selectedIssue.longitude.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">
                          Timeline
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reported
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {format(
                                  new Date(selectedIssue.createdAt),
                                  "PPP",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Reviewed
                              </p>
                              <p className="text-xs text-gray-900 dark:text-white font-medium">
                                {format(
                                  new Date(selectedIssue.reviewedAt),
                                  "PPP",
                                )}
                              </p>
                            </div>
                          </div>
                          {selectedIssue.resolvedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Resolved
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {format(
                                    new Date(selectedIssue.resolvedAt),
                                    "PPPpp",
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedIssue.rejectedAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Rejected
                                </p>
                                <p className="text-xs text-gray-900 dark:text-white font-medium">
                                  {new Date(
                                    selectedIssue.rejectedAt,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Evidence Carousel */}
                      {selectedIssue.status === "resolved" &&
                        (selectedIssue.photosBefore.length > 0 ||
                          selectedIssue.photosAfter.length > 0) && (
                          <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">
                              Evidence
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {selectedIssue.photosBefore[0] && (
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                                    BEFORE
                                  </p>
                                  <img
                                    src={selectedIssue.photosBefore[0]}
                                    alt="Before"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-red-300 dark:border-red-700"
                                  />
                                </div>
                              )}
                              {selectedIssue.photosAfter[0] && (
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                                    AFTER
                                  </p>
                                  <img
                                    src={selectedIssue.photosAfter[0]}
                                    alt="After"
                                    className="w-full h-32 object-cover rounded-lg border-2 border-emerald-300 dark:border-emerald-700"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Public Notes */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase">
                          Public Notes
                        </h4>
                        {selectedIssue.publicCompletionNote && (
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 dark:border-emerald-600 p-4 rounded">
                            <p className="text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed">
                              {selectedIssue.publicCompletionNote}
                            </p>
                          </div>
                        )}
                        {selectedIssue.rejectionReason && (
                          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded">
                            <p className="text-sm text-red-900 dark:text-red-300 leading-relaxed">
                              {selectedIssue.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                          <Eye size={18} />
                          View on Map
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(selectedIssue.issueCode, selectedIssue.city);
                          }}
                          className="px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-12 text-center">
                    <Eye
                      className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
                      size={64}
                    />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Select an Issue
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Click on an issue from the list to view detailed
                      information
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Forum - Only shown when issue is selected */}
          {selectedIssue && (
            <div className="mt-8">
              <IssueDiscussionForum
                issueId={selectedIssue.id}
                issueTitle={selectedIssue.title}
              />
            </div>
          )}

          {/* Public Metrics Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3
                className="text-teal-600 dark:text-teal-400"
                size={28}
              />
              Trust & Transparency Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-700 rounded-2xl p-6">
                <Award
                  className="text-teal-600 dark:text-teal-400 mb-3"
                  size={32}
                />
                <p className="text-sm text-teal-700 dark:text-teal-400 font-medium mb-1">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-teal-900 dark:text-teal-300">
                  57%
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200 dark:border-cyan-700 rounded-2xl p-6">
                <Zap
                  className="text-cyan-600 dark:text-cyan-400 mb-3"
                  size={32}
                />
                <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium mb-1">
                  Avg Review Time
                </p>
                <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-300">
                  1.2 days
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6">
                <Target
                  className="text-emerald-600 dark:text-emerald-400 mb-3"
                  size={32}
                />
                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                  Top Ward
                </p>
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                  Lanka
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-6">
                <TrendingUp
                  className="text-amber-600 dark:text-amber-400 mb-3"
                  size={32}
                />
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                  Most Common
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                  Waste
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 dark:bg-emerald-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50">
            <CheckCircle size={20} />
            <span className="font-semibold">Link copied to clipboard!</span>
          </div>
        )}
      </div>
    </div>
  );
}
