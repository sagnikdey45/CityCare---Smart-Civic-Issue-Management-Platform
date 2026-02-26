import { AlertTriangle, Home, RotateCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "../ModeToggle";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const Navbar = ({ formData, setFormData, setCurrentStep }) => {
  const router = useRouter();
  const deleteMedia = useMutation(api.issuesMedia.deleteMedia);
  const [open, setOpen] = useState(false);

  const handleClear = async () => {
    try {
      // Delete photos
      if (formData.photos?.length > 0) {
        await Promise.all(
          formData.photos.map((storageId) => deleteMedia({ storageId })),
        );
      }

      // Delete video
      if (formData.videos?.length > 0) {
        await deleteMedia({ storageId: formData.videos });
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        subcategory: [],
        otherCategoryName: "",
        priority: "",
        tags: [],
        photos: [],
        videos: null,


        searchQuery: "",
        address: "",
        city: "",
        state: "",
        postal: "",
        latitude: 20.5937,
        longitude: 78.9629,
        googleMapUrl: "",

        isAnonymous: false,
        additionalEmail: "",

        createdAt: Date.now(),
      });

      setCurrentStep(1);
      setOpen(false);
    } catch (err) {
      console.error("Error clearing media:", err);
    }
  };

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
              onClick={() => setOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-3xl font-medium transition-all duration-200 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 hover:from-teal-600 hover:via-emerald-600 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/30 dark:shadow-emerald-400/20"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-400">
                <AlertTriangle className="w-5 h-5" />
                Clear This Report?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
                This will permanently delete all uploaded media and reset your
                report. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel className="rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
                Go Back
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleClear}
                className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg"
              >
                Yes, Clear Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </nav>
  );
};

export default Navbar;
