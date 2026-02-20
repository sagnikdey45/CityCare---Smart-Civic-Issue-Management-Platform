"use client";

import { PublicDashboard } from "@/components/Public/PublicDashboard";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <PublicDashboard />
      </Suspense>
    </div>
  );
};

export default page;
