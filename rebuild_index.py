#!/usr/bin/env python3
"""
Rebuild the bestbuy Meilisearch index from scratch with embedders added one by one.
"""

import json
import time
import requests
import sys
import os

# Load env
def load_env(path):
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                env[key.strip()] = val.strip()
    return env

env = load_env('.env.local')

HOST = env['NEXT_PUBLIC_MEILISEARCH_HOST']
ADMIN_KEY = env['MEILISEARCH_ADMIN_KEY']
INDEX = env['NEXT_PUBLIC_MEILISEARCH_INDEX']
HEADERS = {
    'Authorization': f'Bearer {ADMIN_KEY}',
    'Content-Type': 'application/json',
}

CLOUDFLARE_ACCOUNT = 'e73266567c2c759b9f57c5ff839ccf9e'

# Shared document template
DOC_TEMPLATE = (
    "{{doc.name}} is a {{doc.type}} product by {{doc.brand}}. "
    "It costs ${{doc.price}} and falls in the price range of {{doc.price_range}}. "
    "This product offers {{doc.description}} "
    "It is categorized under "
    "{% for category in doc.categories %}"
    "{% if forloop.last %}and {% endif %}"
    "{{category}}"
    "{% unless forloop.last %}, {% endunless %}"
    "{% endfor %}. "
    "The product has a rating of {{doc.rating}} out of 5 stars and "
    "{% if doc.free_shipping %}comes with free shipping"
    "{% else %}does not include free shipping{% endif %}. "
    "You can find more details and purchase this item at {{doc.url}}."
)

DOC_TEMPLATE_MAX_BYTES = 400

# ── Base settings (no embedders) ──────────────────────────────────────────────

BASE_SETTINGS = {
    "searchableAttributes": ["name", "description", "type", "brand"],
    "filterableAttributes": ["brand", "free_shipping", "price_range"],
    "sortableAttributes": ["popularity", "price", "rating"],
    "rankingRules": [
        "words", "typo", "proximity", "attribute", "sort", "exactness",
        "rating:desc", "popularity:desc"
    ],
    "typoTolerance": {
        "enabled": True,
        "minWordSizeForTypos": {"oneTypo": 5, "twoTypos": 9},
        "disableOnWords": [],
        "disableOnAttributes": [],
        "disableOnNumbers": False,
    },
    "faceting": {"maxValuesPerFacet": 100, "sortFacetValuesBy": {"*": "alpha"}},
    "pagination": {"maxTotalHits": 1000},
    "proximityPrecision": "byWord",
}

# ── Embedder definitions ──────────────────────────────────────────────────────

def cf_embedder(model_path, dimensions):
    return {
        "source": "rest",
        "apiKey": env['CLOUDFLARE_API_KEY'],
        "dimensions": dimensions,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT}/ai/run/{model_path}",
        "request": {"text": ["{{text}}", "{{..}}"]},
        "response": {"result": {"data": ["{{embedding}}", "{{..}}"]}},
        "headers": {},
    }

def cohere_v1_embedder(model, dimensions):
    return {
        "source": "rest",
        "apiKey": env['COHERE_API_KEY'],
        "dimensions": dimensions,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://api.cohere.com/v1/embed",
        "request": {
            "model": model,
            "texts": ["{{text}}", "{{..}}"],
            "input_type": "search_document",
        },
        "response": {"embeddings": ["{{embedding}}", "{{..}}"]},
        "headers": {},
    }

def cohere_v2_embedder(model, dimensions):
    return {
        "source": "rest",
        "apiKey": env['COHERE_API_KEY'],
        "dimensions": dimensions,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://api.cohere.com/v2/embed",
        "request": {
            "model": model,
            "texts": ["{{text}}", "{{..}}"],
            "input_type": "search_document",
            "embedding_types": ["float"],
        },
        "response": {"embeddings": {"float": ["{{embedding}}", "{{..}}"]}},
        "headers": {},
    }

def voyage_embedder(model):
    return {
        "source": "rest",
        "apiKey": env['VOYAGE_API_KEY'],
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://api.voyageai.com/v1/embeddings",
        "request": {
            "model": model,
            "input": ["{{text}}", "{{..}}"],
        },
        "response": {"data": [{"embedding": "{{embedding}}"}, "{{..}}"]},
        "headers": {},
    }

EMBEDDERS = {
    # ── Cloudflare Workers AI ─────────────────────────────────────────────
    "cf-bge-small-en-v1.5": cf_embedder("@cf/baai/bge-small-en-v1.5", 384),
    "cf-bge-base-en-v1.5": cf_embedder("@cf/baai/bge-base-en-v1.5", 768),
    "cf-bge-large-en-v1.5": cf_embedder("@cf/baai/bge-large-en-v1.5", 1024),
    "cf-embeddinggemma-300m": cf_embedder("@cf/google/embeddinggemma-300m", 768),
    "cf-qwen3-embedding-0.6b": cf_embedder("@cf/qwen/qwen3-embedding-0.6b", 1024),

    # ── Cohere v3 (kept for comparison) ───────────────────────────────────
    "cohere-embed-english-light-v3.0": cohere_v1_embedder("embed-english-light-v3.0", 384),
    "cohere-embed-english-v3.0": cohere_v1_embedder("embed-english-v3.0", 1024),
    "cohere-embed-multilingual-light-v3.0": cohere_v1_embedder("embed-multilingual-light-v3.0", 384),
    "cohere-embed-multilingual-v3.0": cohere_v1_embedder("embed-multilingual-v3.0", 1024),

    # ── Cohere v4 (NEW) ──────────────────────────────────────────────────
    "cohere-embed-v4.0": cohere_v2_embedder("embed-v4.0", 1536),

    # ── Jina ──────────────────────────────────────────────────────────────
    "jina-colbert-v2": {
        "source": "rest",
        "apiKey": env['JINA_API_KEY'],
        "dimensions": 128,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://api.jina.ai/v1/multi-vector",
        "request": {
            "model": "jina-colbert-v2",
            "input_type": "document",
            "embedding_type": "float",
            "input": ["{{text}}", "{{..}}"],
        },
        "response": {"data": [{"embeddings": ["{{embedding}}"]}, "{{..}}"]},
        "headers": {},
    },
    "jina-embeddings-v3": {
        "source": "rest",
        "apiKey": env['JINA_API_KEY'],
        "dimensions": 1024,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://api.jina.ai/v1/embeddings",
        "request": {
            "model": "jina-embeddings-v3",
            "input": ["{{text}}", "{{..}}"],
        },
        "response": {"data": [{"embedding": "{{embedding}}"}, "{{..}}"]},
        "headers": {},
    },

    # ── Local HuggingFace models ──────────────────────────────────────────
    "local-all-MiniLM-L6-v2": {
        "source": "huggingFace",
        "model": "sentence-transformers/all-MiniLM-L6-v2",
        "pooling": "forceMean",
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
    },
    "local-bge-base-en-v1.5": {
        "source": "huggingFace",
        "model": "BAAI/bge-base-en-v1.5",
        "pooling": "forceMean",
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
    },
    "local-bge-small-en-v1.5": {
        "source": "huggingFace",
        "model": "BAAI/bge-small-en-v1.5",
        "pooling": "forceMean",
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
    },

    # ── Mistral ───────────────────────────────────────────────────────────
    "mistral": {
        "source": "rest",
        "apiKey": env['MISTRAL_API_KEY'],
        "dimensions": 1024,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://api.mistral.ai/v1/embeddings",
        "request": {
            "model": "mistral-embed",
            "input": ["{{text}}", "{{..}}"],
        },
        "response": {"data": [{"embedding": "{{embedding}}"}, "{{..}}"]},
        "headers": {},
    },

    # ── OpenAI ────────────────────────────────────────────────────────────
    "openai-small": {
        "source": "openAi",
        "model": "text-embedding-3-small",
        "apiKey": env['OPENAI_API_KEY'],
        "dimensions": 1536,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
    },
    "openai-large": {
        "source": "openAi",
        "model": "text-embedding-3-large",
        "apiKey": env['OPENAI_API_KEY'],
        "dimensions": 3072,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
    },

    # ── Google Gemini (NEW) ───────────────────────────────────────────────
    "gemini-embedding-001": {
        "source": "rest",
        "dimensions": 3072,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key={env['GOOGLE_API_KEY']}",
        "request": {
            "requests": [
                {
                    "model": "models/gemini-embedding-001",
                    "content": {"parts": [{"text": "{{text}}"}]},
                    "taskType": "RETRIEVAL_DOCUMENT",
                },
                "{{..}}",
            ]
        },
        "response": {
            "embeddings": [{"values": "{{embedding}}"}, "{{..}}"]
        },
        "headers": {},
    },

    # ── Titan (AWS Bedrock) ───────────────────────────────────────────────
    "titan": {
        "source": "rest",
        "apiKey": env['BEDROCK_ACESS_KEY'],
        "dimensions": 1024,
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://bedrock-runtime.eu-west-3.amazonaws.com/model/amazon.titan-embed-text-v2:0/invoke",
        "request": {"inputText": "{{text}}", "normalize": True},
        "response": {"embedding": "{{embedding}}"},
        "headers": {},
    },

    # ── Voyage AI (upgraded to v3.5 family) ───────────────────────────────
    "voyage-3.5-lite": voyage_embedder("voyage-3.5-lite"),
    "voyage-3.5": voyage_embedder("voyage-3.5"),
    "voyage-3-large": voyage_embedder("voyage-3-large"),

    # ── HuggingFace Inference Endpoints (composite) ──────────────────────
    "hf-bge-m3": {
        "source": "composite",
        "searchEmbedder": {
            "source": "huggingFace",
            "model": "BAAI/bge-small-en-v1.5",
            "revision": "5c38ec7c405ec4b44b94cc5a9bb96e735b38267a",
            "pooling": "forceCls",
        },
        "indexingEmbedder": {
            "source": "rest",
            "apiKey": env['HUGGINGFACE_API_KEY'],
            "documentTemplate": DOC_TEMPLATE,
            "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
            "url": "https://dh21a9te5svpu9rf.us-east-1.aws.endpoints.huggingface.cloud",
            "request": {"inputs": ["{{text}}", "{{..}}"]},
            "response": ["{{embedding}}", "{{..}}"],
            "headers": {},
        },
    },
    "hf-mxbai-embed-large": {
        "source": "rest",
        "apiKey": env['HUGGINGFACE_API_KEY'],
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://ldj9u4h0gyb9qi20.us-east-1.aws.endpoints.huggingface.cloud",
        "request": {"inputs": ["{{text}}", "{{..}}"]},
        "response": ["{{embedding}}", "{{..}}"],
        "headers": {},
    },
    "hf-bge-small-en-v1.5": {
        "source": "rest",
        "apiKey": env['HUGGINGFACE_API_KEY'],
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://da5peib03ny96dve.us-east-1.aws.endpoints.huggingface.cloud",
        "request": {"inputs": ["{{text}}", "{{..}}"]},
        "response": ["{{embedding}}", "{{..}}"],
        "headers": {},
    },
    "hf-zembed-1": {
        "source": "rest",
        "apiKey": env['HUGGINGFACE_API_KEY'],
        "documentTemplate": DOC_TEMPLATE,
        "documentTemplateMaxBytes": DOC_TEMPLATE_MAX_BYTES,
        "url": "https://mqvpex39rnefzw52.eu-west-1.aws.endpoints.huggingface.cloud",
        "request": {"inputs": ["{{text}}", "{{..}}"]},
        "response": ["{{embedding}}", "{{..}}"],
        "headers": {},
    },
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def api(method, path, data=None):
    url = f"{HOST}{path}"
    r = requests.request(method, url, headers=HEADERS, json=data)
    if r.status_code >= 400:
        print(f"  ERROR {r.status_code}: {r.text[:500]}")
    return r

def wait_for_task(task_uid, label="task", timeout=3600):
    """Poll a task until it succeeds or fails."""
    start = time.time()
    while time.time() - start < timeout:
        r = api('GET', f'/tasks/{task_uid}')
        info = r.json()
        status = info.get('status', 'unknown')
        if status == 'succeeded':
            print(f"  ✓ {label} succeeded ({int(time.time()-start)}s)")
            return True
        elif status in ('failed', 'canceled'):
            print(f"  ✗ {label} {status}: {info.get('error', {}).get('message', 'unknown')}")
            return False
        time.sleep(5)
    print(f"  ✗ {label} timed out after {timeout}s")
    return False

def wait_for_idle(label="indexing", timeout=7200):
    """Wait until the index is no longer indexing."""
    start = time.time()
    time.sleep(3)
    while time.time() - start < timeout:
        r = api('GET', f'/indexes/{INDEX}/stats')
        stats = r.json()
        if not stats.get('isIndexing', False):
            print(f"  ✓ {label} complete ({int(time.time()-start)}s)")
            return True
        elapsed = int(time.time() - start)
        print(f"  ... still indexing ({elapsed}s)", end='\r')
        time.sleep(10)
    print(f"  ✗ {label} timed out")
    return False

# ── Main rebuild ──────────────────────────────────────────────────────────────

def main():
    # Allow resuming from a specific embedder
    start_from = sys.argv[1] if len(sys.argv) > 1 else None
    skip = start_from is not None

    if not start_from:
        # Step 1: Delete index
        print("═" * 60)
        print("Step 1: Deleting index...")
        r = api('DELETE', f'/indexes/{INDEX}')
        if r.status_code < 400:
            task_uid = r.json().get('taskUid')
            wait_for_task(task_uid, "delete index")
        else:
            print("  Index may not exist, continuing...")

        # Step 2: Create index
        print("\nStep 2: Creating index...")
        r = api('POST', '/indexes', {"uid": INDEX, "primaryKey": "objectID"})
        task_uid = r.json().get('taskUid')
        wait_for_task(task_uid, "create index")

        # Step 3: Apply base settings
        print("\nStep 3: Applying base settings...")
        r = api('PATCH', f'/indexes/{INDEX}/settings', BASE_SETTINGS)
        task_uid = r.json().get('taskUid')
        wait_for_task(task_uid, "apply settings")

        # Step 4: Push documents in batches
        print("\nStep 4: Pushing 10,000 documents...")
        with open('backup_all_docs.json') as f:
            docs = json.load(f)

        batch_size = 2000
        for i in range(0, len(docs), batch_size):
            batch = docs[i:i+batch_size]
            r = api('POST', f'/indexes/{INDEX}/documents', batch)
            task_uid = r.json().get('taskUid')
            wait_for_task(task_uid, f"docs batch {i//batch_size + 1}/{(len(docs)-1)//batch_size + 1}")

        wait_for_idle("document indexing")

    # Step 5: Add embedders one by one
    print("\n" + "═" * 60)
    print(f"Step 5: Adding {len(EMBEDDERS)} embedders one by one...")
    print("═" * 60)

    timings = {}

    for i, (name, config) in enumerate(EMBEDDERS.items(), 1):
        if skip:
            if name == start_from:
                skip = False
            else:
                print(f"\n[{i}/{len(EMBEDDERS)}] Skipping {name}")
                continue

        print(f"\n[{i}/{len(EMBEDDERS)}] Adding embedder: {name}")
        embedder_start = time.time()

        r = api('PATCH', f'/indexes/{INDEX}/settings', {
            "embedders": {name: config}
        })

        if r.status_code >= 400:
            print(f"  Skipping {name} due to error")
            timings[name] = "FAILED"
            continue

        task_uid = r.json().get('taskUid')
        ok = wait_for_task(task_uid, f"settings for {name}", timeout=7200)
        if ok:
            wait_for_idle(f"embedding {name}", timeout=7200)

        elapsed = time.time() - embedder_start
        minutes = int(elapsed // 60)
        seconds = int(elapsed % 60)
        timings[name] = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"
        print(f"  ⏱  {name} total: {timings[name]}")

    # Final summary
    print("\n" + "═" * 60)
    print("Embedding times summary (10,000 documents):")
    print("─" * 60)
    max_name_len = max(len(n) for n in timings)
    for name, duration in timings.items():
        print(f"  {name:<{max_name_len}}  {duration}")
    print("═" * 60)

    # Final stats
    print("\nFinal stats:")
    r = api('GET', f'/indexes/{INDEX}/stats')
    print(json.dumps(r.json(), indent=2))
    print("═" * 60)
    print("Done!")

if __name__ == '__main__':
    main()
