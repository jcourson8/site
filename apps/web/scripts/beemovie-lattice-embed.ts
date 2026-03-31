/**
 * Chunk beemovie.txt into 10-line units, build a height-capped lattice,
 * embed all nodes via Vercel AI Gateway (Gemini embeddings), embed sample queries,
 * and write JSON with precomputed cosine-similarity scores for heatmap viz.
 *
 * Env: AI_GATEWAY_API_KEY (repo root `.env` loaded via `pnpm beemovie:embed`)
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cosineSimilarity, embed, embedMany } from "ai";

const LINE_BREAK = /\r?\n/;

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Monorepo root: `scripts/` lives under `apps/web/scripts`. */
const REPO_ROOT = join(__dirname, "../../..");
const SCRIPT_PATH = join(REPO_ROOT, "beemovie.txt");

const LINES_PER_UNIT = 10;
const MAX_HEIGHT = 30;
/** Gemini batch embed limit via AI Gateway */
const EMBED_BATCH = 100;
/** Parallel embedding requests (each up to EMBED_BATCH texts) */
const PARALLEL_EMBEDS = 8;
const EMBEDDING_MODEL = "google/gemini-embedding-2" as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function toVec(e: readonly number[]): number[] {
  return e as number[];
}

async function embedAllTexts(texts: string[]): Promise<number[][]> {
  const batches = chunk(texts, EMBED_BATCH);
  const embeddings: number[][] = [];

  for (let i = 0; i < batches.length; i += PARALLEL_EMBEDS) {
    const wave = batches.slice(i, i + PARALLEL_EMBEDS);
    const results = await Promise.all(
      wave.map((values) =>
        embedMany({
          model: EMBEDDING_MODEL,
          values,
          maxParallelCalls: 1,
          maxRetries: 2,
        })
      )
    );
    for (const r of results) {
      for (const emb of r.embeddings) {
        embeddings.push(toVec(emb));
      }
    }
    const done = Math.min(i + PARALLEL_EMBEDS, batches.length);
    console.log(
      `Embedded ${done}/${batches.length} batches (${embeddings.length}/${texts.length} vectors)`
    );
  }

  return embeddings;
}

function buildLeaves(allLines: string[]): string[] {
  const leaves: string[] = [];
  for (let i = 0; i < allLines.length; i += LINES_PER_UNIT) {
    leaves.push(allLines.slice(i, i + LINES_PER_UNIT).join("\n"));
  }
  return leaves;
}

interface LatticeNodeMeta {
  e: number;
  h: number;
  preview: string;
  s: number;
}

function buildLattice(
  leaves: string[],
  maxH: number
): {
  metas: LatticeNodeMeta[];
  texts: string[];
} {
  const N = leaves.length;
  const capH = Math.min(maxH, Math.max(0, N - 1));
  const texts: string[] = [];
  const metas: LatticeNodeMeta[] = [];

  for (let h = 0; h <= capH; h++) {
    const w = h + 1;
    for (let s = 0; s <= N - w; s++) {
      const e = s + h;
      const slice = leaves.slice(s, e + 1);
      const body = slice.join("\n\n");
      const preview = body.length > 120 ? `${body.slice(0, 117)}...` : body;
      texts.push(body);
      metas.push({ h, s, e, preview });
    }
  }

  return { texts, metas };
}

const SAMPLE_QUERIES = [
  "bees fly because they don't care what humans think is impossible",
  "a bee gets stuck on a tennis ball during a match, launched back and forth across the court, sucked into a car engine, trapped in a house, and nearly eaten with dip",
  "the entire opening from waking up and getting dressed through graduation, the honey factory tour, arguing with his parents about not wanting the job, sneaking out to join the pollen jocks, the preflight checklist, and finally launching out of the hive for the first time",
  "a character discovers something they took for granted was actually stolen from their community on an industrial scale",
  "two characters from completely different worlds meet by accident, overcome mutual fear, and start to trust each other",
  "after the bees win the lawsuit the honey is returned to the hive but the bees stop working and flowers across the city start dying",
];

async function main() {
  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error(
      "Missing AI_GATEWAY_API_KEY. Run via pnpm beemovie:embed (loads repo .env)."
    );
    process.exit(1);
  }

  const raw = await readFile(SCRIPT_PATH, "utf8");
  const lines = raw.split(LINE_BREAK);
  const leaves = buildLeaves(lines);
  const { texts, metas } = buildLattice(leaves, MAX_HEIGHT);

  console.log(
    `Leaves ${leaves.length}, max height ${MAX_HEIGHT}, nodes ${texts.length}, model ${EMBEDDING_MODEL}`
  );

  const nodeEmbeddings = await embedAllTexts(texts);

  if (nodeEmbeddings.length !== texts.length) {
    throw new Error(
      `Embedding count mismatch: ${nodeEmbeddings.length} vs ${texts.length}`
    );
  }

  const examples: { query: string; scores: number[] }[] = [];

  for (const query of SAMPLE_QUERIES) {
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: query,
      maxRetries: 2,
    });
    const qv = toVec(embedding);
    const scores = nodeEmbeddings.map((v) => cosineSimilarity(qv, v));
    examples.push({ query, scores });
    console.log(`Query ok: ${query.slice(0, 50)}…`);
  }

  const outDir = join(__dirname, "../public/data");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, "beemovie-lattice-heatmap.json");

  const payload = {
    meta: {
      linesPerUnit: LINES_PER_UNIT,
      maxHeight: MAX_HEIGHT,
      leafCount: leaves.length,
      nodeCount: metas.length,
      embedModel: EMBEDDING_MODEL,
      embedBatch: EMBED_BATCH,
      parallelEmbeds: PARALLEL_EMBEDS,
    },
    nodes: metas.map((m, i) => ({ i, ...m })),
    examples,
  };

  await writeFile(outPath, `${JSON.stringify(payload)}\n`, "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
