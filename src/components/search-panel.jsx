import React, { useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import Hits from "@/components/hits";
import { Badge } from "@/components/ui/badge";
import { ConfigSelector } from "./config-selector";
import { search } from "@/lib/searchUtils";
import { cn } from "@/lib/utils";

function SearchPanel({ query, initialConfig, onConfigChange, comparedToConfig }) {
  const [config, setConfig] = React.useState(initialConfig || {
    engine: "meilisearch",
    mode: "fulltextsearch",
    model: "cf-bge-base-en-v1.5"
  });
  const [results, setResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const abortControllerRef = useRef(null);
  const [searchError, setSearchError] = React.useState(false);

  const runSearch = useCallback(async (searchQuery) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await search({
        engine: config.engine,
        query: searchQuery,
        config,
        abortSignal: abortControllerRef.current.signal,
      });

      if (response.query === searchQuery) {
        setResults(response);
        setIsLoading(false);
        setSearchError(false);
      } else {
        console.log("Query changed, skipping results update");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
        setSearchError(true);
      }
      setIsLoading(false);
    }
  }, [config]);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      setIsLoading(true);
      runSearch(searchQuery);
    }, 300),
    [runSearch]
  );

  useEffect(() => {
    console.log("Query changed:", query);
    debouncedSearch(query);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debouncedSearch]);

  const handleConfigChange = useCallback((newConfig) => {
    setConfig((prevConfig) => {
      if (JSON.stringify(prevConfig) !== JSON.stringify(newConfig)) {
        onConfigChange(newConfig);
        return newConfig;
      }
      return prevConfig;
    });
  }, [onConfigChange]);

  return (
    <div className="">
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4">
        <ConfigSelector 
          onConfigChange={handleConfigChange} 
          initialConfig={config} 
          className="w-full sm:w-auto" 
        />
        <div className="self-end sm:self-auto">
          {!isLoading && (
            <Badge 
              variant="outline" 
              className={cn(
                searchError && "bg-transparent text-red-800 border-red-300"
              )}
            >
              {searchError ? "x" : `${results.processingTimeMs}ms`}
            </Badge>
          )}
          {isLoading && <Badge variant="outline">Loading...</Badge>}
        </div>
      </div>
      <Hits results={results.hits} config={config} compared_to={comparedToConfig} query={query}></Hits>
    </div>
  );
}

export { SearchPanel };
