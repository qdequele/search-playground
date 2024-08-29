"use client";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchPanel } from "@/components/search-panel";
import { useRouter, useSearchParams } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = React.useState("");
  const [config1, setConfig1] = React.useState({});
  const [config2, setConfig2] = React.useState({});

  useEffect(() => {
    const query = searchParams.get("q") || "";
    const config1Param = searchParams.get("config1");
    const config2Param = searchParams.get("config2");

    setSearchValue(query);
    if (config1Param) setConfig1(JSON.parse(decodeURIComponent(config1Param)));
    if (config2Param) setConfig2(JSON.parse(decodeURIComponent(config2Param)));
  }, [searchParams]);

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
    if (Object.keys(cfg1).length)
      params.set("config1", encodeURIComponent(JSON.stringify(cfg1)));
    if (Object.keys(cfg2).length)
      params.set("config2", encodeURIComponent(JSON.stringify(cfg2)));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <div className="flex justify-center">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full h-full">
        <div>
          <SearchPanel
            query={searchValue}
            initialConfig={config1}
            onConfigChange={(cfg) => handleConfigChange(1, cfg)}
          />
        </div>
        <div className="">
          <SearchPanel
            query={searchValue}
            initialConfig={config2}
            onConfigChange={(cfg) => handleConfigChange(2, cfg)}
          />
        </div>
      </div>
    </div>
  );
}
