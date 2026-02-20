import { Home, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "../ModeToggle";

const Navbar = ({ setFormData, setCurrentStep }) => {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center group gap-2">
              <Image
                src="/logo.png"
                alt="CityCare Logo"
                width={40}
                height={40}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-500 bg-clip-text text-transparent">
                CityCare
              </span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-5">
            <ModeToggle />
            <button
              onClick={() => router.push("/citizen/")}
              className="flex items-center space-x-2 px-4 py-2 rounded-3xl font-medium transition-all duration-200 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => {
                setFormData({
                  // --- Issue details ---
                  title: "",
                  description: "",
                  category: "",
                  severity: "",
                  photoUrl: null,

                  // --- Location details ---
                  searchQuery: "", // Raw search text typed or selected
                  address: "", // Full formatted address
                  city: "", // City or locality
                  state: "", // State / region
                  postal: "", // Postal code
                  latitude: 20.5937, // Default center (India)
                  longitude: 78.9629,
                  mapUrl: "", // Google Maps URL for location

                  // Reporter details
                  isAnonymous: false,
                  email: "",

                  createdAt: Date.now(),
                });
                setCurrentStep(1);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-3xl font-medium transition-all duration-200 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 hover:from-teal-600 hover:via-emerald-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/30 dark:shadow-emerald-400/20 backdrop-blur-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
