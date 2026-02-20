import {
  Check,
  CircleCheck,
  FileText,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";

const ProgressBar = ({ currentStep }) => {
  const steps = [
    {
      number: 1,
      label: "Details",
      description: "Basic information",
      icon: FileText,
    },
    {
      number: 2,
      label: "Location",
      description: "Address details",
      icon: MapPin,
    },
    { number: 3, label: "Submit", description: "Review & confirm", icon: Send },
  ];

  const getStepColor = (stepNum) => {
    if (stepNum === 1)
      return {
        from: "from-teal-500 dark:from-teal-400",
        to: "to-teal-600 dark:to-teal-500",
        shadow: "shadow-teal-500/50 dark:shadow-teal-400/60",
        glow: "from-teal-400/40 dark:from-teal-300/50",
        glowVia: "via-teal-400/40 dark:via-teal-300/50",
      };
    if (stepNum === 2)
      return {
        from: "from-emerald-500 dark:from-emerald-400",
        to: "to-emerald-600 dark:to-emerald-500",
        shadow: "shadow-emerald-500/50 dark:shadow-emerald-400/60",
        glow: "from-emerald-400/40 dark:from-emerald-300/50",
        glowVia: "via-emerald-400/40 dark:via-emerald-300/50",
      };
    return {
      from: "from-cyan-500 dark:from-cyan-400",
      to: "to-cyan-600 dark:to-cyan-500",
      shadow: "shadow-cyan-500/50 dark:shadow-cyan-400/60",
      glow: "from-cyan-400/40 dark:from-cyan-300/50",
      glowVia: "via-cyan-400/40 dark:via-cyan-300/50",
    };
  };

  return (
    <div className="w-full py-16 relative">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-cyan-500/5 dark:from-teal-400/10 dark:via-emerald-400/10 dark:to-cyan-400/10 rounded-3xl blur-3xl" />

      {/* Desktop View */}
      <div className="hidden md:block relative">
        <div className="flex items-center justify-between relative px-12">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;
            const Icon = step.icon;
            const colors = getStepColor(step.number);

            return (
              <div
                key={step.number}
                className={`flex items-center ${index === steps.length - 1 ? "flex-none" : "flex-1"}`}
              >
                <div className="flex flex-col items-center relative min-w-[160px] group">
                  {/* Multi-layer Glow Effects */}
                  {isActive && (
                    <>
                      <div
                        className={`absolute -top-4 w-32 h-32 rounded-full bg-gradient-to-r ${colors.glow} ${colors.glowVia} to-cyan-500/40 dark:to-cyan-400/50 blur-3xl animate-pulse`}
                      />
                      <div
                        className={`absolute -top-2 w-28 h-28 rounded-full bg-gradient-to-r ${colors.glow} ${colors.glowVia} to-cyan-500/30 dark:to-cyan-400/40 blur-2xl animate-ping opacity-75`}
                      />
                      <div
                        className={`absolute top-0 w-24 h-24 rounded-full bg-gradient-to-r ${colors.glow} ${colors.glowVia} to-cyan-500/20 dark:to-cyan-400/30 blur-xl`}
                      />
                    </>
                  )}

                  {/* Outer Ring with Animation */}
                  <div className="relative z-10">
                    <div
                      className={`absolute inset-0 rounded-3xl transition-all duration-700 ${
                        isActive
                          ? "animate-spin-slow bg-gradient-to-r from-teal-500 dark:from-teal-400 via-emerald-500 dark:via-emerald-400 to-cyan-600 dark:to-cyan-500 p-[3px] opacity-60 dark:opacity-70"
                          : ""
                      }`}
                      style={{ animationDuration: "3s" }}
                    >
                      {isActive && (
                        <div className="w-full h-full rounded-3xl bg-transparent" />
                      )}
                    </div>

                    {/* Step Container with Gradient Border */}
                    <div
                      className={`relative rounded-3xl p-[3px] transition-all duration-700 ${
                        isCompleted
                          ? `bg-gradient-to-br ${colors.from} via-emerald-500 dark:via-emerald-400 ${colors.to}`
                          : isActive
                            ? "bg-gradient-to-br from-teal-400 dark:from-teal-300 via-emerald-400 dark:via-emerald-300 to-cyan-500 dark:to-cyan-400"
                            : "bg-gray-300 dark:bg-gray-600/80"
                      }`}
                    >
                      {/* Inner Step Circle */}
                      <div
                        className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden ${
                          isCompleted
                            ? `bg-gradient-to-br ${colors.from} via-emerald-500 dark:via-emerald-400 ${colors.to} text-white shadow-2xl ${colors.shadow}`
                            : isActive
                              ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 shadow-2xl shadow-emerald-500/40 dark:shadow-emerald-400/60"
                              : "bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 shadow-lg dark:shadow-gray-900/50"
                        } ${isActive ? "scale-110" : isCompleted ? "scale-100" : "scale-95 group-hover:scale-100"}`}
                      >
                        {/* Sparkle Effect for Active */}
                        {isActive && (
                          <Sparkles className="absolute top-2 right-2 w-4 h-4 text-emerald-500 dark:text-emerald-300 animate-pulse" />
                        )}

                        {/* Icon or Check */}
                        {isCompleted ? (
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
                            <Check
                              className="w-12 h-12 relative"
                              strokeWidth={3}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Icon
                              className={`w-9 h-9 mb-1 transition-all duration-1000 ${
                                isActive ? "animate-bounce" : ""
                              }`}
                              strokeWidth={2}
                            />
                            <span className="text-xs font-bold tracking-wider">
                              {step.number}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Labels with Enhanced Typography */}
                  <div className="mt-6 text-center space-y-2">
                    <h3
                      className={`text-lg font-bold tracking-tight transition-all duration-500 ${
                        isCompleted || isActive
                          ? "text-gray-900 dark:text-gray-50"
                          : "text-gray-500 dark:text-gray-400"
                      } ${isActive ? "scale-105" : ""}`}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`text-xs font-medium tracking-wide transition-all duration-500 ${
                        isCompleted || isActive
                          ? "text-gray-600 dark:text-gray-300"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Enhanced Status Badge */}
                  {isCompleted && (
                    <div className="mt-4 relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} opacity-20 dark:opacity-30 blur-lg rounded-full`}
                      />
                      <div
                        className={`flex items-center gap-1 relative px-4 py-1.5 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} text-white text-xs font-bold shadow-lg ${colors.shadow}`}
                      >
                        <CircleCheck className="w-5 h-5" /> Completed
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="mt-4 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 dark:from-teal-300 via-emerald-400 dark:via-emerald-300 to-cyan-500 dark:to-cyan-400 opacity-30 dark:opacity-40 blur-md rounded-full animate-pulse" />
                      <div className="relative px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 dark:from-teal-400 via-emerald-500 dark:via-emerald-400 to-cyan-600 dark:to-cyan-500 text-white text-xs font-bold shadow-lg animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          In Progress
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Connector */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-3 mx-8 -mt-24 relative group">
                    {/* Background track with inner shadow */}
                    <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-750 dark:to-gray-700 rounded-full shadow-inner dark:shadow-gray-900/50 relative overflow-hidden">
                      {/* Animated Progress */}
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                          currentStep > step.number ? "w-full" : "w-0"
                        }`}
                      >
                        {currentStep > step.number && (
                          <>
                            {/* Gradient Progress Bar */}
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 dark:from-teal-400 via-emerald-500 dark:via-emerald-400 to-cyan-600 dark:to-cyan-500 shadow-lg shadow-emerald-500/50 dark:shadow-emerald-400/60" />

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/30 to-transparent animate-shimmer" />

                            {/* Glowing Particles */}
                            <div className="absolute inset-0 flex items-center justify-around px-4">
                              <div className="w-1 h-1 rounded-full bg-white/80 dark:bg-white/90 animate-pulse" />
                              <div className="w-1.5 h-1.5 rounded-full bg-white/60 dark:bg-white/70 animate-pulse delay-150" />
                              <div className="w-1 h-1 rounded-full bg-white/80 dark:bg-white/90 animate-pulse delay-300" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Mobile View */}
      <div className="md:hidden space-y-8 px-6 relative">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const Icon = step.icon;
          const colors = getStepColor(step.number);

          return (
            <div key={step.number} className="relative">
              <div className="flex items-start space-x-5">
                {/* Step Circle */}
                <div className="relative flex-shrink-0">
                  {isActive && (
                    <>
                      <div
                        className={`absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-r ${colors.glow} ${colors.glowVia} to-cyan-500/40 dark:to-cyan-400/50 blur-2xl animate-pulse`}
                      />
                      <div
                        className={`absolute inset-0 w-18 h-18 rounded-2xl bg-gradient-to-r ${colors.glow} ${colors.glowVia} to-cyan-500/30 dark:to-cyan-400/40 blur-xl animate-ping`}
                      />
                    </>
                  )}

                  <div
                    className={`relative rounded-2xl p-[2px] transition-all duration-700 ${
                      isCompleted
                        ? `bg-gradient-to-br ${colors.from} via-emerald-500 dark:via-emerald-400 ${colors.to}`
                        : isActive
                          ? "bg-gradient-to-br from-teal-400 dark:from-teal-300 via-emerald-400 dark:via-emerald-300 to-cyan-500 dark:to-cyan-400"
                          : "bg-gray-200 dark:bg-gray-700/80"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all duration-700 relative z-10 overflow-hidden ${
                        isCompleted
                          ? `bg-gradient-to-br ${colors.from} via-emerald-500 dark:via-emerald-400 ${colors.to} text-white shadow-xl ${colors.shadow}`
                          : isActive
                            ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-300 shadow-xl dark:shadow-emerald-400/60"
                            : "bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 shadow-lg dark:shadow-gray-900/50"
                      }`}
                    >
                      {isActive && (
                        <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-emerald-500 dark:text-emerald-300 animate-pulse" />
                      )}

                      {isCompleted ? (
                        <Check className="w-10 h-10" strokeWidth={2.5} />
                      ) : (
                        <>
                          <Icon
                            className={`w-8 h-8 mb-0.5 ${isActive ? "animate-bounce" : ""}`}
                            strokeWidth={2}
                          />
                          <span className="text-xs font-bold">
                            {step.number}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3
                    className={`text-xl font-bold transition-all duration-500 ${
                      isCompleted || isActive
                        ? "text-gray-900 dark:text-gray-50"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={`text-sm mt-1.5 font-medium transition-all duration-500 ${
                      isCompleted || isActive
                        ? "text-gray-600 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {step.description}
                  </p>
                  {isCompleted && (
                    <div className="mt-3 inline-block relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} opacity-20 dark:opacity-30 blur-md rounded-full`}
                      />
                      <div
                        className={`relative px-4 py-1.5 rounded-full bg-gradient-to-r ${colors.from} ${colors.to} text-white text-xs font-bold shadow-lg ${colors.shadow}`}
                      >
                        Completed
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="mt-3 inline-block relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 dark:from-teal-300 via-emerald-400 dark:via-emerald-300 to-cyan-500 dark:to-cyan-400 opacity-30 dark:opacity-40 blur-md rounded-full animate-pulse" />
                      <div className="relative px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 dark:from-teal-400 via-emerald-500 dark:via-emerald-400 to-cyan-600 dark:to-cyan-500 text-white text-xs font-bold shadow-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          In Progress
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line for Mobile */}
              {index < steps.length - 1 && (
                <div className="absolute left-[2.5rem] top-24 w-1 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`w-full transition-all duration-1000 relative ${
                      currentStep > step.number ? "h-full" : "h-0"
                    }`}
                  >
                    {currentStep > step.number && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-b from-teal-500 dark:from-teal-400 via-emerald-500 dark:via-emerald-400 to-cyan-600 dark:to-cyan-500" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 dark:via-white/25 to-transparent animate-shimmer" />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
