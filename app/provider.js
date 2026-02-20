"use client";

import { SessionProvider } from "next-auth/react";
import { ConvexClientProvider } from "./ConvexClientProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </SessionProvider>
  );
}
