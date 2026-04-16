"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, SkipForward } from "lucide-react";
import { tutorialSteps } from "./tutorialData";

const SpotlightTutorial = ({
  currentStep,
  setCurrentStep,
  showPreview,
  setShowPreview,
  showTutorial,
  setShowTutorial,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const retryCount = useRef(0);

  const currentTutorialStep = tutorialSteps[stepIndex];

  // Sync form step with tutorial step
  useEffect(() => {
    if (showTutorial && currentTutorialStep) {
      if (currentTutorialStep.formStep === 4) {
        if (!showPreview) setShowPreview(true);
      } else {
        if (showPreview) setShowPreview(false);
        if (currentTutorialStep.formStep !== currentStep) {
          setCurrentStep(currentTutorialStep.formStep);
        }
      }
    }
  }, [
    stepIndex,
    showTutorial,
    currentTutorialStep,
    currentStep,
    setCurrentStep,
    showPreview,
    setShowPreview,
  ]);

  const updateTargetRect = useCallback(() => {
    if (!showTutorial || !currentTutorialStep) return;

    const element = document.querySelector(currentTutorialStep.target);
    if (element) {
      // Ensure element is in view
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Delay rect calculation slightly for scroll to settle
      const timeoutId = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          retryCount.current = 0;
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      // Retry if not found (up to 5 times)
      if (retryCount.current < 5) {
        retryCount.current += 1;
        const retryTimeout = setTimeout(updateTargetRect, 500);
        return () => clearTimeout(retryTimeout);
      }
      setTargetRect(null);
    }
  }, [showTutorial, currentTutorialStep]);

  useEffect(() => {
    setIsMounted(true);
    updateTargetRect();

    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect);

    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect);
    };
  }, [updateTargetRect, stepIndex]);

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Removed persistence as requested - runs on every refresh or trigger
    setShowTutorial(false);

    // Immediate reset to Step 1 and Close Preview to prevent dimming issues
    setStepIndex(0);
    setCurrentStep(1);
    setShowPreview(false);
    setTargetRect(null);
  };

  if (!showTutorial || !currentTutorialStep) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Dim Overlay with Cutout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 pointer-events-auto"
          style={{
            clipPath: targetRect
              ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.left + targetRect.width}px ${targetRect.top}px, ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px, ${targetRect.left}px ${targetRect.top + targetRect.height}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
              : "none",
          }}
        />
      </AnimatePresence>

      {/* Spotlight Border & Pulse */}
      {targetRect && (
        <motion.div
          layoutId="spotlight"
          initial={false}
          animate={{
            top: targetRect.top - 12,
            left: targetRect.left - 12,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            opacity: 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute rounded-2xl border-2 border-emerald-500/80 z-[101] pointer-events-none"
        >
          {/* Internal Pulse Ring */}
          <motion.div
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl bg-emerald-500/10"
          />
          
          {/* External Ping Ring */}
          <motion.div
            animate={{
              scale: [1, 1.2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute -inset-4 rounded-3xl border border-emerald-500/30"
          />
        </motion.div>
      )}

      {/* Tooltip / Popover */}
      {targetRect && (
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top:
                currentTutorialStep.position === "bottom"
                  ? targetRect.top + targetRect.height + 24
                  : "auto",
              bottom:
                currentTutorialStep.position === "top"
                  ? window.innerHeight - targetRect.top + 24
                  : "auto",
              left: Math.max(
                20,
                Math.min(
                  window.innerWidth - 340,
                  targetRect.left + targetRect.width / 2 - 160,
                ),
              ),
              width: "320px",
            }}
            className="z-[102] pointer-events-auto"
          >
            <div className="relative group/tooltip">
              {/* Background Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover/tooltip:opacity-40 transition duration-500"></div>

              <div className="relative bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30">
                    Step {stepIndex + 1} of {tutorialSteps.length}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Content */}
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                  {currentTutorialStep.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {currentTutorialStep.description}
                </p>

                {/* Controls */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    <SkipForward size={14} />
                    Skip
                  </button>

                  <div className="flex items-center gap-2">
                    {stepIndex > 0 && (
                      <button
                        onClick={handleBack}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {stepIndex === tutorialSteps.length - 1
                        ? "Finish"
                        : "Next"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default SpotlightTutorial;
