import React from "react";
import { Shield, MapPin } from "lucide-react";

export default function CityAdminScopeHeader({ city, state }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 rounded-3xl p-8 shadow-xl text-white mb-8">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase backdrop-blur-md mb-3 border border-white/10">
            <Shield size={12} /> City Administrator Scope
          </div>
          <h1 className="text-3xl font-black tracking-tight capitalize">
            {city} City Operations Overview
          </h1>
          <p className="text-white/80 font-medium text-sm mt-1">
            Real-time civic operations management, SLA tracking, and staff
            coordination
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-md">
          <MapPin size={16} className="text-cyan-300 flex-shrink-0" />
          <span className="text-sm font-extrabold tracking-wide uppercase">
            Administrative Scope: {city}, {state}
          </span>
        </div>
      </div>
    </div>
  );
}
