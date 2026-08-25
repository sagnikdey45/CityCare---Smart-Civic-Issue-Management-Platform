"use client";

import { LandingPage } from "@/components/LandingPage";
import {useRouter } from "next/navigation";
import React from "react";

const page = () => {
  const router = useRouter();
  return <div>
    <LandingPage onGetStarted={router.push("/sign-in")}/>
  </div>;
};

export default page;
