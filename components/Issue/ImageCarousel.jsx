"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { cn } from "@/lib/utils";

/* -----------------------------------
   Single Image Resolver
------------------------------------ */
function CarouselImage({ storageId, index, removeMedia }) {
  const url = useQuery(api.issuesMedia.getMediaUrl, {
    storageId,
  });

  if (!url) {
    return (
      <div className="w-full h-60 sm:h-72 md:h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative h-60 sm:h-72 md:h-80 group">
      {/* Image */}
      <img
        src={url}
        alt={`Image ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* Delete Button */}
      <button
        onClick={() => removeMedia(storageId, "image")}
        className="
          absolute top-3 right-3 z-30
          bg-red-500/90 hover:bg-red-600
          text-white p-2 rounded-full
          opacity-0 group-hover:opacity-100
          transition-all shadow-lg
        "
      >
        ✕
      </button>
    </div>
  );
}

/* -----------------------------------
   Main Carousel
------------------------------------ */
export default function ImageCarousel({ images = [], removeMedia }) {
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(1);
  const [count, setCount] = useState(0);

  /* -------------------------------
     Sync Carousel State
  -------------------------------- */
  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    update();

    api.on("select", update);
    api.on("reInit", update); // when slides change

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api, images]);

  if (!images.length) return null;

  return (
    <div
      className="
      relative mt-6 rounded-2xl overflow-hidden
      border border-gray-200 dark:border-gray-700
      bg-white dark:bg-gray-900 shadow-lg
    "
    >

      {/* --------------------------------
          SLIDE COUNT (1 / N)
      -------------------------------- */}
      <div
        className="
        absolute bottom-3 right-4 z-20
        px-3 py-1 rounded-full text-xs font-medium
        bg-black/60 text-white backdrop-blur
      "
      >
        {current} / {count}
      </div>

      {/* --------------------------------
          CAROUSEL
      -------------------------------- */}
      <Carousel
        setApi={setApi}
        opts={{
          loop: true, // ✅ Infinite loop
          align: "center",
        }}
        className="w-full"
      >
        <CarouselContent>
          {images.map((storageId, index) => (
            <CarouselItem key={storageId}>
              <CarouselImage
                storageId={storageId}
                index={index}
                removeMedia={removeMedia}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Arrows */}
        <CarouselPrevious className="left-2 bg-white/80 dark:bg-dark-400/80 backdrop-blur border shadow" />
        <CarouselNext className="right-2 bg-white/80 dark:bg-dark-400/80 backdrop-blur border shadow" />
      </Carousel>

      {/* --------------------------------
          DOT INDICATORS
      -------------------------------- */}
      <div className="flex justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-800">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              current === index + 1
                ? "bg-emerald-500 scale-125"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400",
            )}
          />
        ))}
      </div>
    </div>
  );
}
