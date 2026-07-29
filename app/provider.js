"use client";

import { SessionProvider } from "next-auth/react";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { GoogleMapsProvider } from "@/components/maps/GoogleMapsProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ConvexClientProvider>
        <GoogleMapsProvider>{children}</GoogleMapsProvider>
      </ConvexClientProvider>
    </SessionProvider>
  );
}
