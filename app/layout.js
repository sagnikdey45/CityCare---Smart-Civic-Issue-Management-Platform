import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Providers from "./provider";
import { Toaster } from "@/components/ui/sonner";
import SessionWatcher from "@/components/SessionWatcher";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "CityCare - Helping the community",
  description: "Civic Issue Reporting & Transparency Hub",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {children}
            <SessionWatcher />
          </Providers>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
