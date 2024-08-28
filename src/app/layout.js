import { Inter as FontSans } from "next/font/google";
import { cn } from "../lib/utils";
import "./globals.css";
import * as React from "react";
import { CircleDotDashed } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Search Playground",
  description: "Test your search though various of options",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
          <div className="flex-col flex">
            <div className="border-b">
              <div className="flex flex-raw items-center justify-between mx-6 my-3">
                <div className="flex items-center text-lg font-medium ">
                  <CircleDotDashed className="h-6 w-6" />
                  <h1 className="pl-6 font-bold">Search Playground</h1>
                </div>
                <ModeToggle />
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
