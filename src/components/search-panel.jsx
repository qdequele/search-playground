import React, { useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash";
import Hits from "@/components/hits";
import { ModelSelector } from "@/components/model-selector";
import { MeiliSearch } from "meilisearch";
import { Badge } from "@/components/ui/badge";
import { ModeSelector } from "./mode-selector";

function SearchPanel({ query }) {
  const [model, setModel] = React.useState("openai-small");
  const [mode, setMode] = React.useState("fulltextsearch");
  const [results, setResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const abortControllerRef = useRef(null);

  const client = new MeiliSearch({
    host: "https://ms-5b551fba0b81-185.lon.meilisearch.io",
    apiKey: "9dbfdfd7a1a99d353f6673b4ad27601029f04d70ff89e578646244e25db0ded2",
  });

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      runSearch(searchQuery);
    }, 300),
    [model, mode]
  );

  useEffect(() => {
    console.log("Query changed:", query);
    setIsLoading(true);
    debouncedSearch(query);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debouncedSearch]);

  function onModelChange(value) {
    setModel(value);
    debouncedSearch(query);
  }

  function onModeChange(value) {
    setMode(value);
    debouncedSearch(query);
  }

  async function runSearch(searchQuery) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const index = client.index("bestbuy");
    let searchParams = {
      showRankingScore: true,
      attributesToRetrieve: ["name", "description", "image"],
      limit: 5,
    };

    if (mode === "semanticsearch") {
      searchParams = {
        ...searchParams,
        hybrid: {
          semanticRatio: 1,
          embedder: model,
        },
      };
    }
    if (mode === "hybridsearch") {
      searchParams = {
        ...searchParams,
        hybrid: {
          semanticRatio: 0.5,
          embedder: model,
        },
      };
    }

    try {
      const response = await index.search(searchQuery, searchParams, {
        signal: abortControllerRef.current.signal,
      });

      if (response.query === searchQuery) {
        setResults(response);
        setIsLoading(false);
      } else {
        console.log("Query changed, skipping results update");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Search request was cancelled");
      } else {
        console.error("Search error:", error);
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-start gap-2">
          <ModeSelector onChange={onModeChange} />
          {mode !== "fulltextsearch" && (
            <ModelSelector onChange={onModelChange} />
          )}
        </div>
        {results.processingTimeMs !== 0 && !isLoading && (
          <Badge variant="outline">{results.processingTimeMs}ms</Badge>
        )}
        {isLoading && <Badge variant="outline">Loading...</Badge>}
      </div>
      <Hits results={results.hits}></Hits>
    </div>
  );
}

export { SearchPanel };
