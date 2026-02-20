import { CheckCircle2, Award, X } from "lucide-react";

const SuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-zinc-800 shadow-lg mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Report Submitted!
          </h2>
          <p className="text-emerald-50 text-lg">
            Thank you for helping improve our city
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Reward Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-600">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                  +50 CityPoints Earned! 🎉
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You'll receive bonus points once verified
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              What happens next?
            </h3>

            {/* Step 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Review
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our team will review your report within 24 hours
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Assignment
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Issue will be assigned to the relevant department
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                  Resolution
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track progress and get updates on resolution
                </p>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all dark:hover:from-teal-500 dark:hover:to-cyan-500"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
