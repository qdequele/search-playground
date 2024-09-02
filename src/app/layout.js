import { Inter as FontSans } from "next/font/google";
import { cn } from "../lib/utils";
import "./globals.css";
import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Banner } from "@/components/Banner";
import { Navbar } from "@/components/Navbar";
import { FathomAnalytics } from "@/components/fathom";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Search Playground",
  description: "Test your search though various of options",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/meilisearch-favicon.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FathomAnalytics />
          <Banner />
          <Navbar />
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
