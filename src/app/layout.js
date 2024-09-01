import { Inter as FontSans } from "next/font/google";
import { cn } from "../lib/utils";
import "./globals.css";
import * as React from "react";
import { CircleDotDashed, Github } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Banner } from "@/components/Banner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          <Banner />
          <div className="flex-col flex">
            <div className="border-b">
              <div className="flex items-center justify-between mx-6 my-3">
                <div className="flex items-center">
                  <CircleDotDashed className="h-6 w-6" />
                  <h1 className="pl-6 font-bold text-lg">Search Playground</h1>
                  <nav className="ml-6 space-x-4">
                    <Link href="/">
                      <Button variant="ghost" size="sm">
                        Playground
                      </Button>
                    </Link>
                    <Link href="/info">
                      <Button variant="ghost" size="sm">
                        Info
                      </Button>
                    </Link>
                    <Link href="/guides">
                      <Button variant="ghost" size="sm">
                        Guides
                      </Button>
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="https://www.meilisearch.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">Go to Meilisearch</Button>
                  </Link>
                  <Link
                    href="https://github.com/meilisearch/meilisearch"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="icon">
                      <Github className="h-[1.2rem] w-[1.2rem]" />
                      <span className="sr-only">GitHub</span>
                    </Button>
                  </Link>
                  <ModeToggle />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
