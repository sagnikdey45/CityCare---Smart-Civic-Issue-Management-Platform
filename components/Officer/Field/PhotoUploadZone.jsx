import { useState, useRef } from "react";
import { Camera, Upload, X, Check, MapPin, Loader } from "lucide-react";

export function PhotoUploadZone({
  photo,
  onPhotoChange,
  label,
  captureLocation = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const captureGeolocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          reject(new Error(`Unable to get location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  };

  const handleFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    let locationData;

    if (captureLocation) {
      setIsCapturingLocation(true);
      setLocationError(null);
      try {
        locationData = await captureGeolocation();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to capture location";
        setLocationError(errorMessage);
        alert(
          `Location capture failed: ${errorMessage}\n\nPlease enable location services and try again.`,
        );
        setIsCapturingLocation(false);
        return;
      }
      setIsCapturingLocation(false);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      onPhotoChange(result, locationData);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onPhotoChange(null, undefined);
    setLocationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      {isCapturingLocation && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Loader
                className="text-blue-600 dark:text-blue-400 animate-spin"
                size={24}
              />
              <MapPin
                className="text-blue-600 dark:text-blue-400 animate-pulse"
                size={24}
              />
            </div>
            <p className="text-slate-900 dark:text-white font-semibold">
              Capturing Location...
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Please allow location access
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {captureLocation && (
        <div className="mb-3 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <MapPin
            className="text-blue-600 dark:text-blue-400 flex-shrink-0"
            size={16}
          />
          <p className="text-blue-800 dark:text-blue-300">
            <span className="font-semibold">
              Live location capture enabled:
            </span>{" "}
            Your GPS location will be recorded with this photo
          </p>
        </div>
      )}

      {!photo ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105"
              : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
          }`}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={`rounded-full p-4 mb-4 transition-all duration-300 ${
                isDragging
                  ? "bg-blue-100 dark:bg-blue-900/40"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            >
              {isDragging ? (
                <Upload
                  className="text-blue-600 dark:text-blue-400"
                  size={32}
                />
              ) : (
                <Camera
                  className="text-slate-600 dark:text-slate-400"
                  size={32}
                />
              )}
            </div>
            <p className="text-slate-900 dark:text-white font-semibold mb-2">
              {isDragging ? "Drop image here" : `Upload ${label} Photo`}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Drag & drop or click to browse
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                JPG
              </span>
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                PNG
              </span>
              <span className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                Max 10MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="rounded-xl overflow-hidden border-3 border-emerald-500 dark:border-emerald-400 shadow-lg">
            <img src={photo} alt={label} className="w-full h-64 object-cover" />
          </div>

          <div className="absolute top-3 right-3 flex gap-2">
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-full p-2 shadow-lg flex items-center gap-2 px-4">
              <Check size={16} />
              <span className="text-xs font-semibold">Uploaded</span>
            </div>
            <button
              onClick={handleRemove}
              className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
              aria-label="Remove photo"
            >
              <X size={16} />
            </button>
          </div>

          <button
            onClick={handleClick}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl px-6 py-3 flex items-center gap-2 shadow-xl">
              <Upload className="text-blue-600 dark:text-blue-400" size={20} />
              <span className="text-slate-900 dark:text-white font-semibold">
                Replace Photo
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
