"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchPanel } from "@/components/search-panel";

export default function Dashboard() {
  const [searchValue, setSearchValue] = React.useState("");

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Rest of the code...
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
          <SearchPanel query={searchValue} />
        </div>
        <div className="">
          <SearchPanel query={searchValue} />
        </div>
      </div>
    </div>
  );
}
