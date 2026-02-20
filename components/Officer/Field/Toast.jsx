import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export function Toast({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3700);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={24} />,
    error: <XCircle size={24} />,
    info: <Info size={24} />,
  };

  const colors = {
    success: "bg-emerald-600 dark:bg-emerald-500 text-white",
    error: "bg-red-600 dark:bg-red-500 text-white",
    info: "bg-blue-600 dark:bg-blue-500 text-white",
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[70] max-w-md transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${colors[type]} rounded-xl shadow-2xl p-4 flex items-center gap-4 backdrop-blur-md border border-white/20`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="flex-1 font-medium text-sm">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
