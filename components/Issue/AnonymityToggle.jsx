import {
  Shield,
  Mail,
  AlertCircle,
  Lock,
  Bell,
  Award,
  Lightbulb,
} from "lucide-react";

const AnonymityToggle = ({ formData, setFormData, errors }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Shield className="text-emerald-600 dark:text-emerald-400" size={28} />
        Privacy & Contact
      </h2>

      <div className="space-y-6">
        {/* Anonymity toggle */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-700 transition-colors duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                Report Anonymously
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Keep your identity private. We'll still track your report and
                award CityPoints to your account.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <Shield size={14} />
                <span className="font-medium">Your privacy is protected</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, isAnonymous: !formData.isAnonymous })
              }
              className={`relative inline-flex h-12 w-20 flex-shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 ${
                formData.isAnonymous
                  ? "bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 border-emerald-600"
                  : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
            >
              <span
                className={`inline-block h-11 w-11 transform rounded-full bg-white dark:bg-gray-900 shadow-lg ring-0 transition duration-300 ease-in-out ${
                  formData.isAnonymous ? "translate-x-8" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Email input when not anonymous */}
        <div className="animate-fadeIn">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Additional Email Address (Optional)
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, additionalEmail: e.target.value })
              }
              placeholder="your.email@example.com"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                errors.additionalEmail
                  ? "border-red-300 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/40"
                  : "border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-100 dark:focus:ring-emerald-800"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-4 outline-none transition-all duration-300`}
            />
          </div>
          {errors.additionalEmail && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.additionalEmail}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Receive updates about your report and resolution status
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          {/* Secure */}
          <div className="group bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border-blue-200 dark:border-gray-600 border-2 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-xl dark:hover:shadow-blue-700/40 transition-all transform hover:-translate-y-1 hover:scale-[1.02]">
            <div className="bg-blue-600 dark:bg-blue-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Lock className="text-white" size={28} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Secure
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Your data is encrypted and protected
            </p>
          </div>

          {/* Updates */}
          <div className="group bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border-2 border-emerald-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-400 hover:shadow-xl dark:hover:shadow-emerald-700/40 transition-all transform hover:-translate-y-1 hover:scale-[1.02]">
            <div className="bg-emerald-600 dark:bg-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Bell className="text-white" size={28} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Updates
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Get notified about progress
            </p>
          </div>

          {/* Recognition */}
          <div className="group bg-gradient-to-br from-cyan-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border-2 border-cyan-200 dark:border-gray-600 hover:border-cyan-300 dark:hover:border-cyan-400 hover:shadow-xl dark:hover:shadow-cyan-700/40 transition-all transform hover:-translate-y-1 hover:scale-[1.02]">
            <div className="bg-cyan-600 dark:bg-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award className="text-white" size={28} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Recognition
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Earn badges for helping
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 transition-colors">
          <div className="flex gap-3 items-start">
            <Lightbulb className="w-6 h-6 text-yellow-700 dark:text-yellow-300 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
                Why provide contact info?
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-400/90">
                While optional, sharing your email helps us reach out for
                clarification and keeps you informed about the resolution. It
                also builds community trust and accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymityToggle;
