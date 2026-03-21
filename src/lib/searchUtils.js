import { MeiliSearch } from "meilisearch";
import { algoliasearch } from "algoliasearch";
import Typesense from "typesense";

let _meilisearchClient;
function getMeilisearchClient() {
  if (!_meilisearchClient) {
    _meilisearchClient = new MeiliSearch({
      host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST,
      apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY,
    });
  }
  return _meilisearchClient;
}

let _algoliaClient;
function getAlgoliaClient() {
  if (!_algoliaClient) {
    _algoliaClient = algoliasearch(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
    );
  }
  return _algoliaClient;
}

let _typesenseClient;
function getTypesenseClient() {
  if (!_typesenseClient) {
    _typesenseClient = new Typesense.Client({
      nodes: [
        {
          host: new URL(process.env.NEXT_PUBLIC_TYPESENSE_HOST).hostname,
          port: process.env.NEXT_PUBLIC_TYPESENSE_PORT,
          protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 2,
    });
  }
  return _typesenseClient;
}

export async function searchMeilisearch({ query, config, abortSignal }) {
  const index = getMeilisearchClient().index(process.env.NEXT_PUBLIC_MEILISEARCH_INDEX);
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
  const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX;

  try {
    const { results } = await getAlgoliaClient().search({
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
    const searchResults = await getTypesenseClient()
      .collections(process.env.NEXT_PUBLIC_TYPESENSE_COLLECTION)
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
