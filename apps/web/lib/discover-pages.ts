import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const APP_DIR = join(process.cwd(), "app");
const PAGE_EXTENSIONS = [".tsx", ".mdx", ".md"];
const PAGE_PATTERN = /\/?page\.(tsx|mdx|md)$/;
const TITLE_PATTERN = /title:\s*["'`]([^"'`]+)["'`]/;
const DESC_PATTERN = /description:\s*\n?\s*["'`]([^"'`]+)["'`]/;
const DRAFT_PATTERN = /draft:\s*true/;

export interface PageInfo {
  description?: string;
  extension: string;
  filePath: string;
  route: string;
  title?: string;
}

function routeFromFilePath(filePath: string): string {
  const rel = relative(APP_DIR, filePath);
  const dir = rel.replace(PAGE_PATTERN, "");
  if (dir === "") {
    return "/";
  }
  return `/${dir}`;
}

async function extractMetadata(
  filePath: string
): Promise<{ title?: string; description?: string; draft?: boolean }> {
  const source = await readFile(filePath, "utf-8");

  const titleMatch = TITLE_PATTERN.exec(source);
  const descMatch = DESC_PATTERN.exec(source);
  const isDraft = DRAFT_PATTERN.test(source);

  return {
    title: titleMatch?.[1],
    description: descMatch?.[1],
    draft: isDraft || undefined,
  };
}

async function walk(dir: string): Promise<PageInfo[]> {
  const pages: PageInfo[] = [];
  let entryNames: string[];

  try {
    entryNames = await readdir(dir);
  } catch {
    return pages;
  }

  for (const name of entryNames) {
    if (name.startsWith("api") || name.startsWith("_")) {
      continue;
    }

    const full = join(dir, name);
    const s = await stat(full);

    if (s.isDirectory()) {
      pages.push(...(await walk(full)));
      continue;
    }

    const isPage = PAGE_EXTENSIONS.some((ext) => name === `page${ext}`);
    if (!isPage) {
      continue;
    }

    const ext = name.replace("page", "");
    const route = routeFromFilePath(full);
    const meta = await extractMetadata(full);

    if (meta.draft) {
      continue;
    }

    const fallbackTitle =
      route === "/" ? "Home" : (route.split("/").pop() ?? route);

    pages.push({
      route,
      filePath: full,
      extension: ext,
      title: meta.title ?? fallbackTitle,
      description: meta.description,
    });
  }

  return pages;
}

export function discoverPages(): Promise<PageInfo[]> {
  return walk(APP_DIR);
}
