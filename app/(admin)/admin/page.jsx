"use client";

import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>
        Welcome to the admin dashboard. Here you can manage your application.
      </p>
      <p>This page is Coming Soon.....</p>
      <button
        onClick={() => (window.location.href = "/")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go back home
      </button>
    </div>
  );
};

export default page;
