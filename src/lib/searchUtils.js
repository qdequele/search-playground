import { MeiliSearch } from "meilisearch";
import { algoliasearch } from "algoliasearch";

const meilisearchClient = new MeiliSearch({
  host: "https://ms-5b551fba0b81-185.lon.meilisearch.io",
  apiKey: "9dbfdfd7a1a99d353f6673b4ad27601029f04d70ff89e578646244e25db0ded2",
});

const algoliaClient = algoliasearch(
  "NXA0NRXXE7",
  "cbc5b2b33ad87c598a6153fa89aa1a70"
);

export async function searchMeilisearch({ query, config, abortSignal }) {
  const index = meilisearchClient.index("bestbuy");
  let searchParams = {
    showRankingScore: true,
    attributesToRetrieve: ["name", "description", "image"],
    limit: 5,
  };

  if (config.mode === "semanticsearch") {
    searchParams = {
      ...searchParams,
      hybrid: {
        semanticRatio: 1,
        embedder: config.model,
      },
    };
  }
  if (config.mode === "hybridsearch") {
    searchParams = {
      ...searchParams,
      hybrid: {
        semanticRatio: 0.5,
        embedder: config.model,
      },
    };
  }

  try {
    const response = await index.search(query, searchParams, {
      signal: abortSignal,
    });
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Search request was cancelled");
    } else {
      console.error("Search error:", error);
    }
    throw error;
  }
}

export async function searchAlgolia({ query, config, abortSignal }) {
  const indexName = "bestbuy";

  try {
    const { results } = await algoliaClient.search({
      requests: [
        {
          indexName,
          query,
        },
      ],
    });

    // Transform the response to match the structure expected by the Hits component
    return {
      hits: results[0].hits,
      query: query,
      processingTimeMs: results[0].processingTimeMS,
      // Add any other fields that your Hits component expects
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Algolia search request was cancelled");
    } else {
      console.error("Algolia search error:", error);
    }
    throw error;
  }
}

// Main search function that delegates to the appropriate search engine
export async function search({ engine, query, config, abortSignal }) {
  switch (engine) {
    case "meilisearch":
      return searchMeilisearch({ query, config, abortSignal });
    case "algolia":
      return searchAlgolia({ query, config, abortSignal });
    default:
      throw new Error(`Unsupported search engine: ${engine}`);
  }
}
