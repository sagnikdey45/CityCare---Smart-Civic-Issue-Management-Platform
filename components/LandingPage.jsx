import {
  MapPin,
  FileText,
  Bell,
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Award,
  Sparkles,
  ArrowRight,
  Users2,
} from "lucide-react";
import { Leaderboard } from "./LeaderBoard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./ModeToggle";

export function LandingPage({ onGetStarted }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section
        className="relative overflow-hidden 
                    bg-gradient-to-br from-teal-500 via-emerald-700 to-cyan-800 
                    text-white dark:from-teal-700 dark:via-emerald-800 dark:to-cyan-900 
                    transition-all duration-500"
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 
                  bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2dyaWQpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] 
                  opacity-30"
        ></div>

        <div className="absolute top-6 right-6 z-50">
          <ModeToggle />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div
                className="bg-white/10 dark:bg-gray-900/30 
                        backdrop-blur-sm rounded-full p-4 
                        border border-white/20 dark:border-gray-700"
              >
                <Image
                  src="/logo.png"
                  alt="CityCare Logo"
                  width={100}
                  height={100}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
              <span
                className="bg-clip-text text-transparent 
                         bg-gradient-to-r from-teal-400 via-emerald-500 to-green-600 
                         dark:from-teal-300 dark:via-emerald-400 dark:to-cyan-500 
                         drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
              >
                CityCare
              </span>
            </h1>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span
                className="bg-clip-text text-transparent 
                         bg-gradient-to-r from-white via-blue-100 to-white 
                         dark:from-gray-100 dark:via-teal-200 dark:to-gray-50 
                         animate-pulse"
              >
                Improve Your City
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl text-teal-50 dark:text-teal-100 
                    mb-6 max-w-3xl mx-auto leading-relaxed"
            >
              Your voice matters. Report civic issues, track progress, and help
              build a better community together.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push("staff/sign-in")}
                className="group px-8 py-4 bg-white text-teal-600 
                     dark:bg-gray-800 dark:text-emerald-300 
                     rounded-full font-semibold text-lg 
                     hover:bg-teal-100 dark:hover:bg-teal-800 
                     transition-all transform hover:scale-105 hover:shadow-2xl 
                     flex items-center space-x-2"
              >
                <Shield className="text-teal-600 dark:text-emerald-400" />
                <span>Staff Login</span>
                <ArrowRight />
              </button>

              <button
                onClick={() => router.push("sign-up")}
                className="group px-8 py-4 bg-white text-teal-600 
                     dark:bg-gray-800 dark:text-emerald-300 
                     rounded-full font-semibold text-lg 
                     hover:bg-teal-100 dark:hover:bg-teal-800 
                     transition-all transform hover:scale-105 hover:shadow-2xl 
                     flex items-center space-x-2"
              >
                <Users2 className="text-teal-600 dark:text-emerald-400" />
                <span>Get Started</span>
                <ArrowRight />
              </button>

              <button
                onClick={() => router.push("/public-dashboard")}
                className="group px-8 py-4 bg-white text-teal-700 
                     border-2 border-teal-600 
                     dark:bg-gray-900 dark:text-emerald-300 dark:border-emerald-600 
                     rounded-full font-semibold text-lg 
                     hover:bg-teal-100 dark:hover:bg-teal-800 
                     transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <MapPin className="text-teal-600 dark:text-emerald-400" />
                <span>Public Dashboard</span>
              </button>

              <button
                onClick={() => {
                  const section = document.getElementById("how-it-works");
                  section?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-transparent border-2 border-white text-white 
                     dark:border-gray-300 dark:text-gray-100 
                     rounded-full font-semibold text-lg 
                     hover:bg-white/20 dark:hover:bg-teal-700 
                     transition-all"
              >
                Learn More
              </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="my-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div
                className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-md 
                        rounded-2xl p-8 border border-white/20 dark:border-gray-700 
                        hover:bg-white/20 dark:hover:bg-gray-700/50 
                        transition-all hover:scale-105 transform"
              >
                <Sparkles className="text-yellow-300 mb-3" size={32} />
                <div className="text-5xl font-bold mb-2">24/7</div>
                <div className="text-blue-100 dark:text-gray-200 text-lg">
                  Always Available
                </div>
              </div>
              <div
                className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-md 
                        rounded-2xl p-8 border border-white/20 dark:border-gray-700 
                        hover:bg-white/20 dark:hover:bg-gray-700/50 
                        transition-all hover:scale-105 transform"
              >
                <Shield className="text-green-300 mb-3" size={32} />
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-blue-100 dark:text-gray-200 text-lg">
                  Transparent
                </div>
              </div>
              <div
                className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-md 
                        rounded-2xl p-8 border border-white/20 dark:border-gray-700 
                        hover:bg-white/20 dark:hover:bg-gray-700/50 
                        transition-all hover:scale-105 transform"
              >
                <Zap className="text-orange-300 mb-3" size={32} />
                <div className="text-5xl font-bold mb-2">Fast</div>
                <div className="text-blue-100 dark:text-gray-200 text-lg">
                  Quick Response
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="wavet dark:hidden">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>

        <div className="wavetd dark:block hidden">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      <section
        id="features"
        className="py-20 bg-white dark:bg-gray-900 transition-colors duration-500"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to report, track, and resolve civic issues
              efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Easy Reporting */}
            <div
              className="group bg-gradient-to-br from-teal-50 to-white 
                      dark:from-gray-800 dark:to-gray-900 
                      p-8 rounded-2xl border border-teal-100 dark:border-gray-700 
                      hover:border-teal-300 dark:hover:border-emerald-400 
                      hover:shadow-xl dark:hover:shadow-emerald-800/40 
                      transition-all transform hover:-translate-y-1"
            >
              <div className="bg-teal-600 dark:bg-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Easy Reporting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Report issues with just a few clicks. Add photos, location, and
                detailed descriptions.
              </p>
            </div>

            {/* Real-Time Tracking */}
            <div
              className="group bg-gradient-to-br from-emerald-50 to-white 
                      dark:from-gray-800 dark:to-gray-900 
                      p-8 rounded-2xl border border-emerald-100 dark:border-gray-700 
                      hover:border-emerald-300 dark:hover:border-emerald-400 
                      hover:shadow-xl dark:hover:shadow-emerald-700/40 
                      transition-all transform hover:-translate-y-1"
            >
              <div className="bg-emerald-600 dark:bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Real-Time Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Track the status of your reports from submission to resolution
                in real-time.
              </p>
            </div>

            {/* Smart Notifications */}
            <div
              className="group bg-gradient-to-br from-cyan-50 to-white 
                      dark:from-gray-800 dark:to-gray-900 
                      p-8 rounded-2xl border border-cyan-100 dark:border-gray-700 
                      hover:border-cyan-300 dark:hover:border-cyan-400 
                      hover:shadow-xl dark:hover:shadow-cyan-700/40 
                      transition-all transform hover:-translate-y-1"
            >
              <div className="bg-cyan-600 dark:bg-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bell className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Smart Notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Get instant updates when your issue status changes or
                authorities respond.
              </p>
            </div>

            {/* Full Transparency */}
            <div
              className="group bg-gradient-to-br from-sky-50 to-white 
                      dark:from-gray-800 dark:to-gray-900 
                      p-8 rounded-2xl border border-sky-100 dark:border-gray-700 
                      hover:border-sky-300 dark:hover:border-sky-400 
                      hover:shadow-xl dark:hover:shadow-sky-700/40 
                      transition-all transform hover:-translate-y-1"
            >
              <div className="bg-sky-600 dark:bg-sky-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Full Transparency
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                View all city issues and resolutions on our public dashboard for
                complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-20 bg-gradient-to-b from-to-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        id="how-it-works"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Simple, transparent, and effective civic engagement in three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Report Issue
              </h3>
              <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-4">
                Spot a pothole, broken streetlight, or any civic issue? Report
                it instantly with photos and location.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="text-teal-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Upload photos for clarity
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="text-teal-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Auto-detect location
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="text-teal-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Get unique ticket ID
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-4">
                Monitor your issue's journey from pending to resolution with
                real-time status updates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="text-emerald-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Real-time status updates
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="text-emerald-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Timeline of actions
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="text-emerald-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Instant notifications
                  </span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                See Results
              </h3>
              <p className="text-gray-600 dark:text-gray-200 leading-relaxed mb-4">
                Watch as authorities resolve your issue and see the positive
                impact on your community.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle
                    className="text-orange-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Resolution confirmation
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="text-orange-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    View before/after updates
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle
                    className="text-orange-600 mr-2 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <span className="text-gray-600 dark:text-gray-200">
                    Public transparency
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with modern technology for maximum reliability and
              transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
                <Users className="text-blue-600 dark:text-blue-400" size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Community First
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built for citizens, by citizens. Every voice matters in making
                our city better.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                <Zap className="text-green-600 dark:text-green-400" size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Report issues in seconds and get instant notifications on status
                changes.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full mb-6">
                <Shield
                  className="text-purple-600 dark:text-purple-400"
                  size={36}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is protected with enterprise-grade security and
                privacy standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 rounded-full p-3 shadow-md dark:shadow-yellow-700/20">
                <Award className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Community Champions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Recognizing our most active contributors making our city better
              every day
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Leaderboard />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 text-white relative dark:from-teal-800 dark:via-emerald-800 dark:to-cyan-900 transition-colors duration-500">
        {/* Bottom Wave Design */}
        <div className="waveb dark:hidden">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
        <div className="wavebd hidden dark:block">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>

        <div className="relative mt-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white dark:text-white">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-teal-50 dark:text-teal-100 mb-8 leading-relaxed">
            Join thousands of citizens working together to build a better city.
            Start reporting issues today.
          </p>
          <button
            onClick={onGetStarted}
            className="group px-10 py-4 bg-white text-teal-600 rounded-full font-semibold text-lg hover:bg-teal-50 dark:bg-gray-100 dark:text-teal-700 dark:hover:bg-gray-200 transition-all transform hover:scale-105 hover:shadow-2xl inline-flex items-center space-x-2"
          >
            <span>Get Started Now</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
