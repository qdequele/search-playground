"use client";
import React, { useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchPanel } from "@/components/search-panel";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = React.useState("");
  const [config1, setConfig1] = React.useState({});
  const [config2, setConfig2] = React.useState({});
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchValue(query);

    // Parse config1 from URL parameters
    const config1 = {
      engine: searchParams.get("engine1") || "meilisearch",
      mode: searchParams.get("mode1") || "fulltextsearch",
      model: searchParams.get("model1") || "cf-bge-base-en-v1.5",
    };
    setConfig1(config1);

    // Parse config2 from URL parameters
    const config2 = {
      engine: searchParams.get("engine2") || "meilisearch",
      mode: searchParams.get("mode2") || "fulltextsearch",
      model: searchParams.get("model2") || "cf-bge-base-en-v1.5",
    };
    setConfig2(config2);
  }, [searchParams]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearchChange = (event) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    updateURL(newValue, config1, config2);
  };

  const handleConfigChange = (panelNumber, newConfig) => {
    if (panelNumber === 1) {
      setConfig1((prevConfig) => {
        if (JSON.stringify(prevConfig) !== JSON.stringify(newConfig)) {
          updateURL(searchValue, newConfig, config2);
          return newConfig;
        }
        return prevConfig;
      });
    } else {
      setConfig2((prevConfig) => {
        if (JSON.stringify(prevConfig) !== JSON.stringify(newConfig)) {
          updateURL(searchValue, config1, newConfig);
          return newConfig;
        }
        return prevConfig;
      });
    }
  };

  const updateURL = (query, cfg1, cfg2) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);

    // Set config1 parameters
    if (cfg1.engine) params.set("engine1", cfg1.engine);
    if (cfg1.mode) params.set("mode1", cfg1.mode);
    if (cfg1.model) params.set("model1", cfg1.model);

    // Set config2 parameters
    if (cfg2.engine) params.set("engine2", cfg2.engine);
    if (cfg2.mode) params.set("mode2", cfg2.mode);
    if (cfg2.model) params.set("model2", cfg2.model);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="flex justify-center mb-4">
        <div className="relative w-full max-w-[336px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div
        className={`grid ${
          isMobile ? "grid-cols-1" : "grid-cols-2"
        } gap-4 w-full h-full`}
      >
        <SearchPanel
          query={searchValue}
          initialConfig={config1}
          onConfigChange={(cfg) => handleConfigChange(1, cfg)}
        />
        {!isMobile && (
          <SearchPanel
            query={searchValue}
            initialConfig={config2}
            onConfigChange={(cfg) => handleConfigChange(2, cfg)}
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
