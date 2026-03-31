import { readFile } from "node:fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import TurndownService from "turndown";
import { discoverPages } from "@/lib/discover-pages";
import { mdxToMarkdown } from "@/lib/mdx-to-markdown";

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
});

turndown.addRule("removeScripts", {
  filter: ["script", "style", "noscript", "iframe", "canvas"],
  replacement: () => "",
});

const MAIN_TAG = /<main[\s>][\s\S]*?<\/main>/i;
const SCRIPT_TAGS = /<script[\s>][\s\S]*?<\/script>/gi;
const STYLE_TAGS = /<style[\s>][\s\S]*?<\/style>/gi;
const SELF_NEXT = /self\.__next[\s\S]*?(?=<\/script>|$)/gi;

function normalizeSlug(slug: string): string {
  if (slug === "index") {
    return "/";
  }
  return `/${slug}`;
}

async function htmlToMarkdown(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const html = await res.text();

  const mainMatch = MAIN_TAG.exec(html);
  const raw = mainMatch ? mainMatch[0] : html;
  const cleaned = raw
    .replace(SCRIPT_TAGS, "")
    .replace(STYLE_TAGS, "")
    .replace(SELF_NEXT, "");

  return turndown.turndown(cleaned).trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const slug = path.join("/");
  const route = normalizeSlug(slug);

  const pages = await discoverPages();
  const page = pages.find((p) => p.route === route);

  if (!page) {
    return new NextResponse("Not found", { status: 404 });
  }

  let markdown: string;

  if (page.extension === ".mdx" || page.extension === ".md") {
    const raw = await readFile(page.filePath, "utf-8");
    markdown = await mdxToMarkdown(raw);
  } else {
    const origin = request.nextUrl.origin;
    const pageUrl = route === "/" ? origin : `${origin}${route}`;
    markdown = await htmlToMarkdown(pageUrl);
  }

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
