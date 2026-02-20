import { Suspense } from "react";
import SignInPage from "@/components/Login/SigninPage";
import React from "react";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
        <SignInPage />
      </Suspense>
    </div>
  );
};

export default page;
