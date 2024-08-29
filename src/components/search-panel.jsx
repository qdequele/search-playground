import React, { useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import Hits from "@/components/hits";
import { Badge } from "@/components/ui/badge";
import { ConfigSelector } from "./config-selector";
import { search } from "@/lib/searchUtils";

function SearchPanel({ query, initialConfig, onConfigChange }) {
  const [config, setConfig] = React.useState(initialConfig || {
    engine: "meilisearch",
    mode: "fulltextsearch",
    model: "cf-bge-base-en-v1.5"
  });
  const [results, setResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const abortControllerRef = useRef(null);

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
      } else {
        console.log("Query changed, skipping results update");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
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
      <div className="flex items-center justify-between mb-4 flex-wrap">
        <ConfigSelector onConfigChange={handleConfigChange} initialConfig={config} className="mb-2" />
        <div>
          {results.processingTimeMs !== 0 && !isLoading && (
            <Badge variant="outline">{results.processingTimeMs}ms</Badge>
          )}
          {isLoading && <Badge variant="outline">Loading...</Badge>}
        </div>
      </div>
      <Hits results={results.hits}></Hits>
    </div>
  );
}

export { SearchPanel };
