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
  MessageSquare,
  Droplets,
  Trash2,
  Recycle,
  Package,
  HeartPulse,
  MoreHorizontal
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
    version: "3.64",
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
      }, 0) / (resolved.length || 1);

    const avgRating =
      resolved.reduce((acc, issue) => acc + (issue.citizenRating || 0), 0) /
      (resolved.length || 1);

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

  const categories = [
    {
      value: "road",
      label: "Road & Infrastructure",
      icon: MapPin,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      value: "electricity",
      label: "Electricity & Lighting",
      icon: Zap,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      value: "water",
      label: "Water Supply",
      icon: Droplets,
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      value: "sanitation",
      label: "Sanitation & Waste",
      icon: Trash2,
      color: "text-green-600 dark:text-green-400",
    },
    {
      value: "drainage",
      label: "Drainage & Sewer",
      icon: Recycle,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      value: "solid_waste",
      label: "Solid Waste Management",
      icon: Package,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      value: "public_health",
      label: "Public Health",
      icon: HeartPulse,
      color: "text-red-600 dark:text-red-400",
    },
    {
      value: "other",
      label: "Other",
      icon: MoreHorizontal,
      color: "text-gray-600 dark:text-gray-400",
    },
  ];

  const getCategoryLabel = (val) => {
    const found = categories.find((c) => c.value === val);
    return found ? found.label : val;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-teal-400/20 dark:bg-teal-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 dark:bg-cyan-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-emerald-400/20 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-60"></div>

      <div className="relative z-10 min-h-screen transition-colors duration-500">
        {/* Top Navbar */}
        <PublicNavbar />

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12 relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-24 bg-teal-500/10 dark:bg-teal-400/5 filter blur-3xl rounded-full"></div>
            <h2 className="relative text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-teal-700 via-cyan-600 to-emerald-600 dark:from-teal-300 dark:via-cyan-300 dark:to-emerald-300 bg-clip-text text-transparent mb-4 drop-shadow-sm">
              CityCare Transparency
            </h2>
            <p className="relative text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Real-time civic progress tracking across{" "}
              <span className="font-bold text-teal-600 dark:text-teal-400">{cityName === "Loading..." ? "your city" : cityName}</span>
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold bg-emerald-100/80 dark:bg-emerald-900/50 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-emerald-200 dark:ring-emerald-700/50">
                  +12% vs Last Mo
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wider relative">
                Total Resolved
              </p>
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative">
                {kpis.totalResolved}
              </p>
            </div>

            <div className="group relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-400/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-red-400 to-red-600 p-3.5 rounded-2xl shadow-lg shadow-red-500/30">
                  <XCircle className="text-white" size={24} />
                </div>
                <span className="text-red-700 dark:text-red-300 text-xs font-bold bg-red-100/80 dark:bg-red-900/50 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-red-200 dark:ring-red-700/50">
                  -3% Improved
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wider relative">
                Total Rejected
              </p>
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative">
                {kpis.totalRejected}
              </p>
            </div>

            <div className="group relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 p-3.5 rounded-2xl shadow-lg shadow-cyan-500/30">
                  <Clock className="text-white" size={24} />
                </div>
                <span className="text-cyan-700 dark:text-cyan-300 text-xs font-bold bg-cyan-100/80 dark:bg-cyan-900/50 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-cyan-200 dark:ring-cyan-700/50">
                  -8% Faster
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wider relative">
                Avg Resolution Time
              </p>
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative flex items-baseline gap-2">
                {kpis.avgResolutionTime}
                <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">days</span>
              </p>
            </div>

            <div className="group relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative flex items-center justify-between mb-6">
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3.5 rounded-2xl shadow-lg shadow-amber-500/30">
                  <Star className="text-white" size={24} />
                </div>
                <span className="text-amber-700 dark:text-amber-300 text-xs font-bold bg-amber-100/80 dark:bg-amber-900/50 backdrop-blur-md px-3 py-1.5 rounded-full ring-1 ring-amber-200 dark:ring-amber-700/50">
                  +5% Rating
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wider relative">
                Avg Citizen Rating
              </p>
              <p className="text-5xl font-extrabold text-gray-900 dark:text-white relative flex items-baseline gap-2">
                {kpis.avgRating}
                <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">/5</span>
              </p>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-teal-900/5 dark:shadow-none mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-xl">
                  <MapIcon className="text-teal-600 dark:text-teal-400" size={24} />
                </div>
                Geographic Insights
              </h3>

              <div className="flex gap-2 p-1 bg-gray-200/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
                <button
                  onClick={() => setMapView("heatmap")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    mapView === "heatmap"
                      ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Heatmap
                </button>

                <button
                  onClick={() => setMapView("pins")}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    mapView === "pins"
                      ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Pins
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-slate-800">
              {!isLoaded || !center ? (
                <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50">
                  <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Initializing Map Data...</p>
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
                    disableDefaultUI: true,
                    zoomControl: true,
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
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center gap-8 text-sm bg-white/50 dark:bg-slate-800/50 py-3 rounded-xl border border-white/50 dark:border-white/5 backdrop-blur-sm w-max mx-auto px-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-gray-700 dark:text-gray-300 font-bold tracking-wide">
                  Successfully Resolved
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                <span className="text-gray-700 dark:text-gray-300 font-bold tracking-wide">
                  Rejected / Invalid
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-white/60 dark:border-white/10 p-6 mb-8 relative z-20">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative group">
                <Search
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-teal-500 transition-colors"
                  size={24}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by issue code, title, or specific area..."
                  className="w-full pl-14 pr-4 py-4 bg-gray-50/50 dark:bg-slate-950/50 backdrop-blur-sm border-2 border-gray-200/60 dark:border-slate-800/60 rounded-2xl focus:ring-4 focus:ring-teal-500/20 dark:focus:ring-teal-400/20 focus:border-teal-500 dark:focus:border-teal-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all text-lg font-medium shadow-inner"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50">
                <Filter size={18} className="text-teal-600 dark:text-teal-400" />
                <span className="font-bold text-sm tracking-wide">Filters</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer hover:border-teal-400 transition-colors"
              >
                <option value="all">Status: All</option>
                <option value="resolved">Status: Resolved</option>
                <option value="rejected">Status: Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer hover:border-teal-400 transition-colors"
              >
                <option value="all">Category: All</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer hover:border-teal-400 transition-colors"
              >
                <option value="all">Ward: All Areas</option>
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
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer hover:border-teal-400 transition-colors"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="rating">Sort: Highest Rated</option>
              </select>

              {(searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all" ||
                wardFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all border border-red-200 dark:border-red-800/50"
                >
                  <X size={16} />
                  Clear All
                </button>
              )}

              <div className="ml-auto flex items-center gap-4 text-sm">
                {selectedIssue && (
                  <button
                    onClick={handleDeselect}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-all"
                  >
                    <X size={14} />
                    Deselect
                  </button>
                )}
                <div className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-xl font-bold border border-teal-200/50 dark:border-teal-800/50 shadow-sm">
                  {filteredIssues.length} <span className="font-medium">results</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Issue List */}
            <div className="lg:col-span-2 space-y-5 relative z-20">
              {filteredIssues.length === 0 ? (
                <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 p-16 text-center shadow-xl">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-gray-400 dark:text-gray-500" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                    No Matching Issues
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
                    We couldn't find any issues matching your exact filters. Try broadening your search criteria.
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
                    className={`relative group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 ${
                      selectedIssue?.id === issue.id
                        ? "shadow-[0_0_0_3px_rgba(20,184,166,1)] dark:shadow-[0_0_0_3px_rgba(45,212,191,1)] shadow-teal-500/30"
                        : "border border-white/60 dark:border-white/10 shadow-lg hover:shadow-2xl hover:shadow-teal-500/10 hover:border-teal-300 dark:hover:border-teal-700"
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/5 to-transparent dark:from-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-7">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${
                              issue.status === "resolved"
                                ? "bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : "bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-800/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                            }`}
                          >
                            {issue.status === "resolved" ? (
                              <CheckCircle size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            {issue.status}
                          </span>
                          <span className="font-mono text-sm bg-gray-100/80 dark:bg-slate-800/80 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full font-bold shadow-sm border border-gray-200 dark:border-slate-700">
                            {issue.issueCode}
                          </span>
                          {(() => {
                            const cat = categories.find(c => c.value === issue.category) || categories[categories.length - 1];
                            const Icon = cat.icon;
                            return (
                              <span className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm border border-gray-100 dark:border-slate-700/50 ${cat.color} bg-white dark:bg-slate-800`}>
                                <Icon size={14} />
                                {cat.label}
                              </span>
                            );
                          })()}
                        </div>
                        {issue.status === "resolved" && issue.citizenRating && (
                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full shadow-sm">
                            <Star
                              className="text-amber-500 drop-shadow-sm"
                              size={16}
                              fill="currentColor"
                            />
                            <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                              {issue.citizenRating}.0
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3 line-clamp-2 tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {issue.title}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                          <MapPin
                            size={16}
                            className="text-teal-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{issue.ward}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
                          <Calendar
                            size={16}
                            className="text-teal-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {format(new Date(issue.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>

                        {issue.status === "resolved" &&
                          (issue.photosBefore.length > 0 ||
                            issue.photosAfter.length > 0) && (
                            <div className="flex items-center gap-2 text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800 font-bold ml-auto shadow-sm">
                              <ImageIcon size={14} />
                              Evidence Available
                            </div>
                          )}

                        {issue.status === "rejected" && issue.rejectionReason && (
                           <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800 font-bold ml-auto max-w-[200px] truncate shadow-sm">
                             <XCircle size={14} />
                             {issue.rejectionReason}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column - Detail Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {selectedIssue ? (
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-none border border-white/60 dark:border-white/10 overflow-hidden transform transition-all">
                    <div
                      className={`relative p-8 overflow-hidden ${
                        selectedIssue.status === "resolved"
                          ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700"
                          : "bg-gradient-to-br from-red-500 via-rose-600 to-orange-600"
                      }`}
                    >
                      {/* Decorative background blobs */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8"></div>
                      
                      <h3 className="relative text-2xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md leading-snug">
                        {selectedIssue.title}
                      </h3>
                      <div className="relative flex flex-wrap items-center gap-2">
                        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm">
                          {selectedIssue.issueCode}
                        </span>
                        <span className="bg-black/20 backdrop-blur-md border border-black/10 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm uppercase tracking-wider">
                          {selectedIssue.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                      <div className="mb-8">
                        <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <Layers size={14} /> Description
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-[15px]">
                          {selectedIssue.description}
                        </p>
                      </div>

                      <div className="mb-8">
                        <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={14} /> Location Details
                        </h4>
                        <div className="bg-gray-50/80 dark:bg-slate-950/50 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-inner">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-xl text-teal-600 dark:text-teal-400 mt-0.5 shadow-sm">
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-bold leading-snug mb-1">
                                {selectedIssue.address}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300">
                                  {selectedIssue.ward} Ward
                                </span>
                                <span className="text-xs font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300">
                                  {selectedIssue.city}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Evidence Carousel styling upgrade */}
                      {selectedIssue.status === "resolved" &&
                        (selectedIssue.photosBefore.length > 0 ||
                          selectedIssue.photosAfter.length > 0) && (
                          <div className="mb-8">
                            <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                              <ImageIcon size={14} /> Photographic Evidence
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              {selectedIssue.photosBefore[0] && (
                                <div className="group relative overflow-hidden rounded-2xl shadow-md border-2 border-red-200 dark:border-red-900/50">
                                  <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 uppercase tracking-wider">
                                    Before
                                  </div>
                                  <img
                                    src={selectedIssue.photosBefore[0]}
                                    alt="Before"
                                    className="w-full h-36 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                              )}
                              {selectedIssue.photosAfter[0] && (
                                <div className="group relative overflow-hidden rounded-2xl shadow-md border-2 border-emerald-200 dark:border-emerald-900/50">
                                  <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 uppercase tracking-wider">
                                    After
                                  </div>
                                  <img
                                    src={selectedIssue.photosAfter[0]}
                                    alt="After"
                                    className="w-full h-36 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Timeline */}
                      <div className="mb-8">
                        <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14} /> Journey Timeline
                        </h4>
                        <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-3 space-y-6 pb-2">
                          <div className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 shadow-sm"></div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Issue Reported</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{format(new Date(selectedIssue.createdAt), "PPP")}</p>
                          </div>
                          
                          <div className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white dark:border-slate-800 shadow-sm shadow-cyan-400/50"></div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Verified & Reviewed</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{format(new Date(selectedIssue.reviewedAt || selectedIssue.createdAt), "PPP")}</p>
                          </div>

                          {selectedIssue.resolvedAt && (
                            <div className="relative pl-6">
                              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-sm shadow-emerald-500/50"></div>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Successfully Resolved</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{format(new Date(selectedIssue.resolvedAt), "PPPpp")}</p>
                            </div>
                          )}
                          
                          {selectedIssue.rejectedAt && (
                            <div className="relative pl-6">
                              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-800 shadow-sm shadow-red-500/50"></div>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Rejected</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{new Date(selectedIssue.rejectedAt).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Public Notes */}
                      {(selectedIssue.publicCompletionNote || selectedIssue.rejectionReason) && (
                        <div className="mb-8">
                          <h4 className="text-xs font-extrabold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={14} /> Official Response
                          </h4>
                          {selectedIssue.publicCompletionNote && (
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl shadow-inner">
                              <p className="text-[15px] font-medium text-emerald-900 dark:text-emerald-200 leading-relaxed">
                                "{selectedIssue.publicCompletionNote}"
                              </p>
                            </div>
                          )}
                          {selectedIssue.rejectionReason && (
                            <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/20 border border-red-200 dark:border-red-800 p-5 rounded-2xl shadow-inner">
                              <p className="text-[15px] font-medium text-red-900 dark:text-red-200 leading-relaxed">
                                "{selectedIssue.rejectionReason}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5"
                        >
                          <MapPin size={18} />
                          Locate Map
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(selectedIssue.issueCode, selectedIssue.city);
                          }}
                          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-600 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        >
                          <Share2 size={18} />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-white/10 p-16 text-center shadow-lg sticky top-28 h-[600px] flex flex-col justify-center">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                      <div className="absolute inset-0 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-full animate-spin-slow"></div>
                      <Layers className="text-gray-400 dark:text-gray-500" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Select an Issue
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-base max-w-[250px] mx-auto">
                      Click on any civic issue card from the list to view comprehensive details, timeline, and official responses.
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
          <div className="mt-16 mb-20 relative z-20">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-2xl mb-4 text-teal-600 dark:text-teal-400 shadow-sm">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Trust & Transparency Metrics
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time civic performance indicators</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 text-teal-600">
                  <Award size={120} />
                </div>
                <Award className="text-teal-500 mb-4 drop-shadow-sm" size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mb-1">
                  Completion Rate
                </p>
                <p className="text-4xl font-black text-gray-900 dark:text-white">
                  57<span className="text-2xl text-teal-500 ml-1">%</span>
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 text-cyan-600">
                  <Zap size={120} />
                </div>
                <Zap className="text-cyan-500 mb-4 drop-shadow-sm" size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mb-1">
                  Avg Review Time
                </p>
                <p className="text-4xl font-black text-gray-900 dark:text-white">
                  1.2<span className="text-lg font-bold text-cyan-500 ml-2">days</span>
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 text-emerald-600">
                  <Target size={120} />
                </div>
                <Target className="text-emerald-500 mb-4 drop-shadow-sm" size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mb-1">
                  Top Ward Focus
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white truncate">
                  Lanka
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 text-amber-600">
                  <TrendingUp size={120} />
                </div>
                <TrendingUp className="text-amber-500 mb-4 drop-shadow-sm" size={36} />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mb-1">
                  Most Common
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white truncate">
                  Waste
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-8 right-8 bg-emerald-500 dark:bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-slide-up z-50 border border-emerald-400 dark:border-emerald-500">
            <CheckCircle size={24} className="animate-pulse" />
            <span className="font-bold tracking-wide">Link successfully copied!</span>
          </div>
        )}
      </div>
    </div>
  );
}
