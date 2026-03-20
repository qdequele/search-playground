import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const models = [
  // Cloudflare Workers AI
  { name: "cf-bge-small-en-v1.5", provider: "Cloudflare", source: "rest", dimensions: 384, indexingTime: "28s" },
  { name: "cf-bge-base-en-v1.5", provider: "Cloudflare", source: "rest", dimensions: 768, indexingTime: "28s" },
  { name: "cf-bge-large-en-v1.5", provider: "Cloudflare", source: "rest", dimensions: 1024, indexingTime: "59s" },
  { name: "cf-embeddinggemma-300m", provider: "Cloudflare", source: "rest", dimensions: 768, indexingTime: "1m 19s", isNew: true },
  { name: "cf-qwen3-embedding-0.6b", provider: "Cloudflare", source: "rest", dimensions: 1024, indexingTime: "4m 3s", isNew: true },
  // Cohere
  { name: "cohere-embed-english-light-v3.0", provider: "Cohere", source: "rest", dimensions: 384, indexingTime: "23s" },
  { name: "cohere-embed-english-v3.0", provider: "Cohere", source: "rest", dimensions: 1024, indexingTime: "~30s" },
  { name: "cohere-embed-multilingual-light-v3.0", provider: "Cohere", source: "rest", dimensions: 384, indexingTime: "28s" },
  { name: "cohere-embed-multilingual-v3.0", provider: "Cohere", source: "rest", dimensions: 1024, indexingTime: "39s" },
  { name: "cohere-embed-v4.0", provider: "Cohere", source: "rest", dimensions: 1536, indexingTime: "33s", isNew: true },
  // Google
  { name: "gemini-embedding-001", provider: "Google", source: "rest", dimensions: 3072, indexingTime: "5m 49s", isNew: true },
  // Jina
  { name: "jina-colbert-v2", provider: "Jina", source: "rest", dimensions: 128, indexingTime: "~30s" },
  { name: "jina-embeddings-v3", provider: "Jina", source: "rest", dimensions: 1024, indexingTime: "1m 35s", isNew: true },
  { name: "jina-embeddings-v5-text-small", provider: "Jina", source: "rest", dimensions: 1024, indexingTime: "1m 30s", isNew: true },
  { name: "jina-embeddings-v5-text-nano", provider: "Jina", source: "rest", dimensions: 768, indexingTime: "2m 5s", isNew: true },
  // Local HuggingFace
  { name: "local-all-MiniLM-L6-v2", provider: "HuggingFace (local)", source: "huggingFace", dimensions: 384, indexingTime: "19m 53s" },
  { name: "local-bge-base-en-v1.5", provider: "HuggingFace (local)", source: "huggingFace", dimensions: 768, indexingTime: "~120m" },
  { name: "local-bge-small-en-v1.5", provider: "HuggingFace (local)", source: "huggingFace", dimensions: 384, indexingTime: "43m 40s" },
  // HuggingFace Inference Endpoints
  { name: "hf-bge-m3", provider: "HuggingFace (endpoint)", source: "rest", dimensions: 1024, indexingTime: "2m 6s" },
  { name: "hf-bge-small-en-v1.5", provider: "HuggingFace (endpoint)", source: "rest", dimensions: 384, indexingTime: "39s" },
  { name: "hf-mxbai-embed-large", provider: "HuggingFace (endpoint)", source: "rest", dimensions: 1024, indexingTime: "2m 46s" },
  { name: "hf-zembed-1", provider: "HuggingFace (endpoint)", source: "rest", dimensions: null, indexingTime: "3m 1s" },
  // Mistral
  { name: "mistral", provider: "Mistral", source: "rest", dimensions: 1024, indexingTime: "5m 26s" },
  // OpenAI
  { name: "openai-small", provider: "OpenAI", source: "openAi", dimensions: 1536, indexingTime: "49s" },
  { name: "openai-large", provider: "OpenAI", source: "openAi", dimensions: 3072, indexingTime: "1m 9s" },
  // Voyage AI
  { name: "voyage-3.5-lite", provider: "Voyage AI", source: "rest", dimensions: 1024, indexingTime: "~30s", isNew: true },
  { name: "voyage-3.5", provider: "Voyage AI", source: "rest", dimensions: 1024, indexingTime: "~30s", isNew: true },
  { name: "voyage-3-large", provider: "Voyage AI", source: "rest", dimensions: 1024, indexingTime: "59s", isNew: true },
];

function parseSeconds(time) {
  if (!time || time === "pending") return Infinity;
  const match = time.match(/~?(\d+)m?\s*(\d+)?s?/);
  if (!match) return Infinity;
  const minutes = time.includes("m") ? parseInt(match[1]) : 0;
  const seconds = time.includes("m") ? parseInt(match[2] || 0) : parseInt(match[1]);
  return minutes * 60 + seconds;
}

function getSpeedColor(time) {
  const secs = parseSeconds(time);
  if (secs <= 35) return "text-green-600 dark:text-green-400";
  if (secs <= 120) return "text-yellow-600 dark:text-yellow-400";
  if (secs <= 600) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function sourceBadgeVariant(source) {
  switch (source) {
    case "rest": return "outline";
    case "openAi": return "secondary";
    case "huggingFace": return "default";
    default: return "outline";
  }
}

export default function ModelsPage() {
  const sorted = [...models].sort((a, b) => parseSeconds(a.indexingTime) - parseSeconds(b.indexingTime));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Embedding Models</h1>
        <p className="text-muted-foreground mt-2">
          Overview of all {models.length} embedding models configured on this Meilisearch instance.
          Indexing times measured on 10,000 Best Buy product documents.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Dimensions</TableHead>
            <TableHead className="text-right">Indexing time (10k docs)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((model) => (
            <TableRow key={model.name}>
              <TableCell className="font-mono text-sm">
                {model.name}
                {model.isNew && (
                  <Badge variant="secondary" className="ml-2 text-xs">new</Badge>
                )}
              </TableCell>
              <TableCell>{model.provider}</TableCell>
              <TableCell>
                <Badge variant={sourceBadgeVariant(model.source)} className="text-xs">
                  {model.source}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {model.dimensions ?? "—"}
              </TableCell>
              <TableCell className={`text-right font-mono font-medium ${getSpeedColor(model.indexingTime)}`}>
                {model.indexingTime}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
