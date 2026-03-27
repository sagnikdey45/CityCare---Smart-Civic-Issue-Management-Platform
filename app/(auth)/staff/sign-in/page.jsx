import { Suspense } from "react";
import React from "react";
import StaffSignIn from "@/components/Login/StaffSigninPage";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <StaffSignIn />
      </Suspense>
    </div>
  );
};

export default page;
