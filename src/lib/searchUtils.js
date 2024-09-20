import { MeiliSearch } from "meilisearch";
import { algoliasearch } from "algoliasearch";
import Typesense from "typesense";

const meilisearchClient = new MeiliSearch({
  host: "https://ms-5b551fba0b81-185.lon.meilisearch.io",
  apiKey: "9dbfdfd7a1a99d353f6673b4ad27601029f04d70ff89e578646244e25db0ded2",
});

const algoliaClient = algoliasearch(
  "NXA0NRXXE7",
  "cbc5b2b33ad87c598a6153fa89aa1a70"
);

const typesenseApiKey = "sc9payw963w65pbpndiziptgbh07zzdb";
const typesenseHost = "https://typesense-production-9968.up.railway.app";

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: "typesense-production-9968.up.railway.app",
      port: "443",
      protocol: "https",
    },
  ],
  apiKey: "sc9payw963w65pbpndiziptgbh07zzdb",
  connectionTimeoutSeconds: 2,
});

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
          hitsPerPage: 5,
          attributesToRetrieve: ["name", "description", "image"],
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

export async function searchTypesense({ query, config, abortSignal }) {
  let searchParameters = {
    q: query,
    query_by: "",
    include_fields: "name,description,image",
    sort_by: "_text_match:desc",
    per_page: 5,
  };

  if (config.mode === "fulltextsearch") {
    searchParameters.query_by = "name,description,brand";
  }

  if (config.mode === "semanticsearch") {
    searchParameters.query_by = `name,${config.model}`;
    searchParameters.vector_query = `${config.model}:([], alpha: 1)`;
    searchParameters.prefix = false;
  }

  if (config.mode === "hybridsearch") {
    searchParameters.query_by = `name,description,brand,${config.model}`;
    searchParameters.vector_query = `${config.model}:([], alpha: 0.5)`;
    searchParameters.prefix = false;
  }

  try {
    const searchResults = await typesenseClient
      .collections("bestbuy")
      .documents()
      .search(searchParameters, { abortSignal });

    // Transform the response to match the structure expected by the Hits component
    return {
      hits: searchResults.hits.map((hit) => ({
        ...hit.document,
        _rankingScore: hit.hybrid_search_info?.rank_fusion_score ?? "",
      })),
      query: query,
      processingTimeMs: searchResults.search_time_ms,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Typesense search request was cancelled");
    } else {
      console.error("Typesense search error:", error);
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
    case "typesense":
      return searchTypesense({ query, config, abortSignal });
    default:
      throw new Error(`Unsupported search engine: ${engine}`);
  }
}
