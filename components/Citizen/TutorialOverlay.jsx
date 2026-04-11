"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

export function TutorialOverlay({ steps, isActive, onComplete }) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to step 1 whenever the tutorial is activated
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      setTargetRect(null);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    setIsTransitioning(true);
    const updatePosition = () => {
      const el = document.querySelector(`[data-tutorial="${steps[currentStep].target}"]`);
      if (el) {
        // Smooth scroll to element ensuring it is positioned well in viewport
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Wait for smooth scroll to finish before clamping rect
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          setIsTransitioning(false);
        }, 500); 
      } else {
        // Fallback if element not found right away
        setTimeout(updatePosition, 250);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentStep]);

  const handleClose = () => {
    localStorage.setItem("citycare_citizen_tutorial_completed", "true");
    if (onComplete) onComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  if (!mounted || !isActive) return null;

  const step = steps[currentStep];
  const Icon = step?.icon;

  const getTooltipPositionStyle = () => {
    if (!targetRect) return { opacity: 0, transform: 'scale(0.95)' };
    
    const margin = 24;
    let top, left;
    const tooltipWidth = 360;
    const isMobile = window.innerWidth <= 640;

    // Mobile layout: always dock to the safe bottom of the screen
    if (isMobile) {
      return {
        top: 'auto',
        bottom: '24px',
        left: '16px',
        right: '16px',
        width: 'auto',
        opacity: 1,
        transform: 'scale(1)',
      };
    }

    switch (step.placement) {
      case "bottom":
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case "bottom-left":
        top = targetRect.bottom + margin;
        left = targetRect.right - tooltipWidth;
        break;
      case "left":
        top = targetRect.top + (targetRect.height / 2) - 100;
        left = targetRect.left - tooltipWidth - margin;
        break;
      default:
        top = targetRect.bottom + margin;
        left = targetRect.left;
    }

    // Viewport bound clamping for Tablet & Desktop safety
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;
    
    // If tooltip drops completely off the bottom edge, push above target
    if (top + 280 > window.innerHeight) {
       top = targetRect.top - 280 - margin;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      opacity: 1,
      transform: 'scale(1)',
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-auto">
      
      {/* Target Spotlight Highlight - Box Shadow powers the dim backdrop */}
      {targetRect && (
        <div 
          className="absolute rounded-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{
            top: targetRect.top - 12 + 'px',
            left: targetRect.left - 12 + 'px',
            width: targetRect.width + 24 + 'px',
            height: targetRect.height + 24 + 'px',
            boxShadow: 'rgba(0, 0, 0, 0.75) 0px 0px 0px 9999px',
            border: '2px solid rgba(16,185,129,0.8)',
          }}
        >
          {/* Internal Pulse Ring */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-[pulse_2s_infinite]"></div>
          {/* External Pulse Ring */}
          <div className="absolute -inset-4 rounded-3xl border border-emerald-500/30 animate-[ping_3s_infinite] opacity-50"></div>
        </div>
      )}

      {/* Floating Glass Tooltip Card */}
      {targetRect && step && (
        <div 
          className={`absolute sm:w-[360px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.35)] p-5 sm:p-7 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] z-[10000] ${isTransitioning ? 'opacity-50 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}
          style={getTooltipPositionStyle()}
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3.5 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200/50 dark:border-emerald-500/20 shadow-inner">
              <Icon size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] font-black text-emerald-600 dark:text-emerald-400 mb-1.5 opacity-80">
                Step {currentStep + 1} of {steps.length}
              </p>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {step.title}
              </h3>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 text-[15px] font-medium leading-relaxed mb-8">
            {step.description}
          </p>

          <div className="flex items-center justify-between w-full mt-4">
            <button 
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200/50 dark:border-white/5 bg-gray-100/50 dark:bg-black/20 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm transition-all focus:outline-none flex items-center gap-2 group"
            >
              <X size={14} className="opacity-70 group-hover:rotate-90 transition-transform duration-500" strokeWidth={3} />
              Skip
            </button>

            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <button 
                onClick={handleNext}
                className="flex items-center gap-1.5 pl-5 pr-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border border-emerald-400/50 dark:border-emerald-500/20 text-white font-extrabold shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                {currentStep !== steps.length - 1 && <ChevronRight size={18} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
