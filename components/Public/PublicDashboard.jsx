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

const DUMMY_ISSUES = [
  {
    id: "1",
    issueCode: "VNS-2024-001",
    title: "Pothole on Lanka Road near BHU Gate",
    description:
      "Large pothole causing traffic issues and accidents. Water accumulation during monsoon makes it dangerous for two-wheelers.",
    category: "road",
    status: "resolved",
    ward: "Lanka",
    address: "BHU Lanka Gate, Main Road",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221005",
    latitude: 25.2677,
    longitude: 82.9913,
    createdAt: "2024-01-15T10:30:00Z",
    reviewedAt: "2024-01-16T14:20:00Z",
    resolvedAt: "2024-01-20T16:45:00Z",
    upvotes: 45,
    citizenRating: 4.5,
    publicCompletionNote:
      "Pothole filled with hot mix asphalt. Road surface leveled and compacted. Quality verification completed.",
    photosBefore: [
      "https://images.pexels.com/photos/6589045/pexels-photo-6589045.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/1004665/pexels-photo-1004665.jpeg",
    ],
  },
  {
    id: "2",
    issueCode: "VNS-2024-002",
    title: "Street Light Not Working at Assi Ghat",
    description:
      "Multiple street lights near Assi Ghat have been non-functional for over a week, creating safety concerns for evening visitors.",
    category: "lighting",
    status: "resolved",
    ward: "Assi",
    address: "Assi Ghat Road, Near Ghat Steps",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221005",
    latitude: 25.282,
    longitude: 83.0047,
    createdAt: "2024-01-10T08:15:00Z",
    reviewedAt: "2024-01-11T09:30:00Z",
    resolvedAt: "2024-01-13T18:20:00Z",
    upvotes: 67,
    citizenRating: 5.0,
    publicCompletionNote:
      "Replaced 4 LED bulbs and repaired electrical wiring. All lights tested and functional.",
    photosBefore: [
      "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg",
    ],
  },
  {
    id: "3",
    issueCode: "VNS-2024-003",
    title: "Garbage Accumulation at Godowlia Market",
    description:
      "Overflowing garbage bins and street waste creating unhygienic conditions in the busy market area.",
    category: "waste",
    status: "resolved",
    ward: "Chowk",
    address: "Godowlia Chowk, Market Area",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221001",
    latitude: 25.3095,
    longitude: 82.9858,
    createdAt: "2024-01-18T07:00:00Z",
    reviewedAt: "2024-01-18T11:30:00Z",
    resolvedAt: "2024-01-19T15:00:00Z",
    upvotes: 89,
    citizenRating: 4.2,
    publicCompletionNote:
      "Cleared 500kg of waste. Sanitized area with disinfectant. Installed 2 additional bins. Scheduled daily pickups.",
    photosBefore: [
      "https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/4098778/pexels-photo-4098778.jpeg",
    ],
  },
  {
    id: "4",
    issueCode: "VNS-2024-004",
    title: "Water Leakage at Sigra Crossing",
    description:
      "Continuous water leakage from underground pipe causing road damage and water wastage.",
    category: "water",
    status: "resolved",
    ward: "Sigra",
    address: "Sigra Main Crossing, Near Police Station",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221010",
    latitude: 25.3176,
    longitude: 82.9739,
    createdAt: "2024-01-12T06:45:00Z",
    reviewedAt: "2024-01-13T10:15:00Z",
    resolvedAt: "2024-01-16T14:30:00Z",
    upvotes: 52,
    citizenRating: 4.8,
    publicCompletionNote:
      "Replaced damaged 6-inch pipeline section. Restored road surface. Water supply normalized.",
    photosBefore: [
      "https://images.pexels.com/photos/2306203/pexels-photo-2306203.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/1194025/pexels-photo-1194025.jpeg",
    ],
  },
  {
    id: "5",
    issueCode: "VNS-2024-005",
    title: "Damaged Footpath at Cantt Station",
    description:
      "Broken tiles and uneven surface on footpath causing difficulty for pedestrians and senior citizens.",
    category: "road",
    status: "resolved",
    ward: "Cantt",
    address: "Cantt Railway Station, Platform Road",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221002",
    latitude: 25.2854,
    longitude: 82.9649,
    createdAt: "2024-01-20T09:20:00Z",
    reviewedAt: "2024-01-21T13:45:00Z",
    resolvedAt: "2024-01-25T17:00:00Z",
    upvotes: 34,
    citizenRating: 4.0,
    publicCompletionNote:
      "Replaced damaged paver blocks. Leveled footpath surface. Added ramp for accessibility.",
    photosBefore: [
      "https://images.pexels.com/photos/7233390/pexels-photo-7233390.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg",
    ],
  },
  {
    id: "6",
    issueCode: "VNS-2024-006",
    title: "Illegal Construction Blocking Drainage",
    description:
      "New construction has blocked public drainage system causing water logging during rains.",
    category: "other",
    status: "rejected",
    ward: "Maldahiya",
    address: "Maldahiya Colony, Lane 4",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221002",
    latitude: 25.2945,
    longitude: 82.9789,
    createdAt: "2024-01-14T11:00:00Z",
    reviewedAt: "2024-01-15T15:30:00Z",
    rejectedAt: "2024-01-16T10:00:00Z",
    upvotes: 23,
    rejectionReason:
      "Issue falls under municipal building department jurisdiction. Forwarded to appropriate authority for legal action.",
    photosBefore: [
      "https://images.pexels.com/photos/1438406/pexels-photo-1438406.jpeg",
    ],
    photosAfter: [],
  },
  {
    id: "7",
    issueCode: "VNS-2024-007",
    title: "Stray Animals on Dashashwamedh Road",
    description:
      "Stray dogs and cattle causing traffic disruption and safety concerns near the main ghat.",
    category: "other",
    status: "rejected",
    ward: "Dashashwamedh",
    address: "Dashashwamedh Ghat Road, Main Entrance",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221001",
    latitude: 25.307,
    longitude: 83.0105,
    createdAt: "2024-01-08T07:30:00Z",
    reviewedAt: "2024-01-09T12:00:00Z",
    rejectedAt: "2024-01-10T09:15:00Z",
    upvotes: 41,
    rejectionReason:
      "Animal welfare issues managed by dedicated department. Complaint forwarded to Animal Husbandry Department.",
    photosBefore: [
      "https://images.pexels.com/photos/1619690/pexels-photo-1619690.jpeg",
    ],
    photosAfter: [],
  },
  {
    id: "8",
    issueCode: "VNS-2024-008",
    title: "Open Manhole at Luxa Road",
    description:
      "Dangerous open manhole without cover or warning signs posing serious accident risk.",
    category: "road",
    status: "resolved",
    ward: "Luxa",
    address: "Luxa Main Road, Near Crossing",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221010",
    latitude: 25.3156,
    longitude: 82.9856,
    createdAt: "2024-01-22T10:15:00Z",
    reviewedAt: "2024-01-22T14:30:00Z",
    resolvedAt: "2024-01-23T11:00:00Z",
    upvotes: 78,
    citizenRating: 5.0,
    publicCompletionNote:
      "Emergency response initiated. Heavy-duty manhole cover installed. Surrounding area marked with reflective paint.",
    photosBefore: [
      "https://images.pexels.com/photos/3933772/pexels-photo-3933772.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/1004665/pexels-photo-1004665.jpeg",
    ],
  },
  {
    id: "9",
    issueCode: "VNS-2024-009",
    title: "Park Maintenance at Ravindrapuri",
    description:
      "Community park needs maintenance - broken swings, overgrown grass, and non-functional lights.",
    category: "other",
    status: "resolved",
    ward: "Ravindrapuri",
    address: "Ravindrapuri Colony Park, Sector B",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221005",
    latitude: 25.2789,
    longitude: 82.9634,
    createdAt: "2024-01-05T08:00:00Z",
    reviewedAt: "2024-01-06T10:30:00Z",
    resolvedAt: "2024-01-12T16:00:00Z",
    upvotes: 56,
    citizenRating: 4.3,
    publicCompletionNote:
      "Repaired play equipment. Trimmed grass and plants. Fixed 6 park lights. Painted benches.",
    photosBefore: [
      "https://images.pexels.com/photos/1445416/pexels-photo-1445416.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg",
    ],
  },
  {
    id: "10",
    issueCode: "VNS-2024-010",
    title: "Broken Street Light at Pandeypur",
    description:
      "Main road street light pole damaged in accident, needs replacement urgently.",
    category: "lighting",
    status: "resolved",
    ward: "Pandeypur",
    address: "Pandeypur Main Road, Near Temple",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221004",
    latitude: 25.2934,
    longitude: 83.0234,
    createdAt: "2024-01-17T06:30:00Z",
    reviewedAt: "2024-01-18T09:00:00Z",
    resolvedAt: "2024-01-21T15:30:00Z",
    upvotes: 38,
    citizenRating: 4.7,
    publicCompletionNote:
      "Installed new LED street light pole with solar backup. Upgraded to energy-efficient system.",
    photosBefore: [
      "https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/2246475/pexels-photo-2246475.jpeg",
    ],
  },
  {
    id: "11",
    issueCode: "VNS-2024-011",
    title: "Noise Pollution from Market",
    description:
      "Excessive loudspeaker noise from market vendors causing disturbance to residents.",
    category: "other",
    status: "rejected",
    ward: "Chowk",
    address: "Chowk Market Area, Central Zone",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221001",
    latitude: 25.3089,
    longitude: 82.9876,
    createdAt: "2024-01-11T09:45:00Z",
    reviewedAt: "2024-01-12T11:20:00Z",
    rejectedAt: "2024-01-13T14:00:00Z",
    upvotes: 19,
    rejectionReason:
      "Noise pollution complaints handled by police department. Case transferred to local police station.",
    photosBefore: [
      "https://images.pexels.com/photos/1309766/pexels-photo-1309766.jpeg",
    ],
    photosAfter: [],
  },
  {
    id: "12",
    issueCode: "VNS-2024-012",
    title: "Waterlogging at Lanka Crossing",
    description:
      "Poor drainage causing severe waterlogging during monsoon affecting traffic and shops.",
    category: "water",
    status: "resolved",
    ward: "Lanka",
    address: "Lanka Crossing, Main Market",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221005",
    latitude: 25.2689,
    longitude: 82.9945,
    createdAt: "2024-01-09T07:15:00Z",
    reviewedAt: "2024-01-10T10:45:00Z",
    resolvedAt: "2024-01-14T16:20:00Z",
    upvotes: 94,
    citizenRating: 4.6,
    publicCompletionNote:
      "Cleaned drainage system. Installed new 12-inch drain pipes. Added 3 new drainage points. Tested during artificial flooding.",
    photosBefore: [
      "https://images.pexels.com/photos/2480072/pexels-photo-2480072.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/1415268/pexels-photo-1415268.jpeg",
    ],
  },
  {
    id: "13",
    issueCode: "VNS-2024-013",
    title: "Encroachment on Public Road",
    description:
      "Shop owners have encroached footpath space with permanent structures.",
    category: "other",
    status: "rejected",
    ward: "Sigra",
    address: "Sigra Market Road, Section C",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221010",
    latitude: 25.3189,
    longitude: 82.9756,
    createdAt: "2024-01-19T08:30:00Z",
    reviewedAt: "2024-01-20T12:15:00Z",
    rejectedAt: "2024-01-21T10:30:00Z",
    upvotes: 28,
    rejectionReason:
      "Encroachment removal requires legal proceedings. Case forwarded to Municipal Enforcement Squad.",
    photosBefore: [
      "https://images.pexels.com/photos/2681319/pexels-photo-2681319.jpeg",
    ],
    photosAfter: [],
  },
  {
    id: "14",
    issueCode: "VNS-2024-014",
    title: "Waste Bin Overflow at Assi",
    description:
      "Public waste bins overflowing daily, creating unhygienic conditions near residential area.",
    category: "waste",
    status: "resolved",
    ward: "Assi",
    address: "Assi Gali, Near Main Square",
    city: "Varanasi",
    state: "Uttar Pradesh",
    postal: "221005",
    latitude: 25.2834,
    longitude: 83.0067,
    createdAt: "2024-01-16T06:00:00Z",
    reviewedAt: "2024-01-17T09:30:00Z",
    resolvedAt: "2024-01-19T14:45:00Z",
    upvotes: 61,
    citizenRating: 4.4,
    publicCompletionNote:
      "Increased pickup frequency to twice daily. Added 4 new large capacity bins. Deployed dedicated cleaning staff.",
    photosBefore: [
      "https://images.pexels.com/photos/3584570/pexels-photo-3584570.jpeg",
    ],
    photosAfter: [
      "https://images.pexels.com/photos/4098779/pexels-photo-4098779.jpeg",
    ],
  },
];

export function PublicDashboard() {
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

  useEffect(() => {
    const cityName = "Varanasi"; // Later you can pass this dynamically

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
  }, []);

  useEffect(() => {
    const idFromUrl = searchParams.get("id");

    if (idFromUrl) {
      const foundIssue = DUMMY_ISSUES.find((issue) => issue.id === idFromUrl);

      if (foundIssue) {
        setSelectedIssue(foundIssue);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const idFromUrl = searchParams.get("id");

    if (!idFromUrl) {
      setSelectedIssue(null);
    }
  }, [searchParams]);

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    let filtered = DUMMY_ISSUES;

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
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "rating") {
        return (b.citizenRating || 0) - (a.citizenRating || 0);
      } else {
        return b.upvotes - a.upvotes;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, categoryFilter, wardFilter, sortBy]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const resolved = DUMMY_ISSUES.filter((i) => i.status === "resolved");
    const rejected = DUMMY_ISSUES.filter((i) => i.status === "rejected");

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
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setWardFilter("all");
    setSortBy("newest");
  };

  const handleShare = (issueId) => {
    const url = `${window.location.origin}/public-dashboard?id=${issueId}`;

    navigator.clipboard.writeText(url);

    // Update URL without page reload
    router.push(`/public-dashboard?id=${issueId}`, { scroll: false });

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
              Track resolved and reviewed civic issues across Varanasi
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
                        router.push(`/public-dashboard?id=${issue.id}`, {
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
                <option value="upvotes">Most Upvoted</option>
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
                      router.push(`/public-dashboard?id=${issue.id}`, {
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
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            size={14}
                            className="text-teal-600 dark:text-teal-400"
                          />
                          <span>{issue.upvotes} upvotes</span>
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
                            handleShare(selectedIssue.id);
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
