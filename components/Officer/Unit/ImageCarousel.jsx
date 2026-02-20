import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full mx-auto">
      {/* Slides */}
      <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-md">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${current * 100}%)`,
          }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full flex justify-center bg-black/5"
            >
              <img
                src={img}
                alt={`Evidence ${idx + 1}`}
                className="w-full h-[50vh] object-contain bg-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev Button */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="
            absolute left-3 top-1/2 -translate-y-1/2
            bg-white/90 hover:bg-white
            p-2 rounded-full shadow-lg
            border border-gray-200
            transition
          "
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            bg-white/90 hover:bg-white
            p-2 rounded-full shadow-lg
            border border-gray-200
            transition
          "
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`
                w-2.5 h-2.5 rounded-full transition-all
                ${
                  current === idx
                    ? "bg-purple-600 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
}
