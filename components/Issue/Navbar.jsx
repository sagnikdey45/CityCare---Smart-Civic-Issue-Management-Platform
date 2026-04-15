import { AlertTriangle, Home, Trash2, Sparkles, FileText } from "lucide-react";
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
      if (formData.photos?.length > 0) {
        await Promise.all(
          formData.photos.map((storageId) => deleteMedia({ storageId })),
        );
      }
      if (formData.videos?.length > 0) {
        await deleteMedia({ storageId: formData.videos });
      }
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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">

        {/* ── Solid-glass bar: opaque enough to be visually heavy ── */}
        <div className="absolute inset-0
          bg-white dark:bg-slate-900
          border-b-2 border-emerald-200/80 dark:border-emerald-700/60
          shadow-[0_4px_32px_-4px_rgba(16,185,129,0.18)] dark:shadow-[0_4px_32px_-4px_rgba(16,185,129,0.25)]
        " />

        {/* ── Teal→cyan gradient strip at the very top ── */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500" />

        {/* ── Subtle emerald wash behind content ── */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/40 via-transparent to-cyan-50/30 dark:from-emerald-950/40 dark:via-transparent dark:to-teal-950/30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo ── */}
            <Link href="/" className="group flex items-center gap-3">
              {/* Logo glow ring */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-emerald-400/40 dark:bg-emerald-500/30 rounded-xl blur-md scale-110 group-hover:scale-125 transition-all duration-300" />
                <div className="relative p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/60 shadow-md">
                  <Image
                    src="/logo.png"
                    alt="CityCare Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
              </div>
              {/* Brand text */}
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  CityCare
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500 hidden sm:block">
                  Civic · Transparent
                </span>
              </div>
            </Link>

            {/* ── Centre chip ── */}
            <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-emerald-100 dark:bg-emerald-900/50
              border border-emerald-300 dark:border-emerald-600/60
              shadow-sm shadow-emerald-500/10">
              <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 tracking-wide">
                New Issue Report
              </span>
              <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-2.5">
              <ModeToggle />

              {/* Dashboard */}
              <button
                onClick={() => router.push("/citizen/")}
                className="group flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm
                  bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700
                  border border-slate-300 dark:border-slate-600
                  text-slate-700 dark:text-slate-200
                  shadow-sm hover:shadow-md
                  hover:-translate-y-0.5 active:scale-95
                  transition-all duration-200"
              >
                <Home className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {/* Clear — prominent danger button */}
              <button
                onClick={() => setOpen(true)}
                className="group relative flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm overflow-hidden
                  shadow-lg shadow-red-500/25 dark:shadow-red-500/30
                  hover:shadow-xl hover:shadow-red-500/40
                  hover:-translate-y-0.5 active:scale-95
                  transition-all duration-200 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-rose-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* shine swipe */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <Trash2 className="relative w-4 h-4" />
                <span className="relative hidden sm:inline">Clear</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── Clear Confirmation Dialog ── */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="rounded-3xl overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-2xl shadow-black/30 p-0">
            {/* Gradient header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 px-7 py-6">
              <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-4 left-8 w-24 h-24 bg-orange-300/20 rounded-full blur-xl pointer-events-none" />
              <AlertDialogHeader>
                <AlertDialogTitle className="relative flex items-center gap-2.5 text-white font-black text-xl">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  Clear This Report?
                </AlertDialogTitle>
                <AlertDialogDescription className="relative text-red-100/80 mt-1.5 text-sm leading-relaxed">
                  This will permanently delete all uploaded media and reset your
                  entire report. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <div className="px-7 py-5">
              <AlertDialogFooter className="flex gap-3 sm:flex-row">
                <AlertDialogCancel className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all duration-200">
                  Go Back
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="flex-1 relative overflow-hidden rounded-2xl font-bold text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-600" />
                  <span className="relative">Yes, Clear Everything</span>
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </nav>
    </>
  );
};

export default Navbar;
