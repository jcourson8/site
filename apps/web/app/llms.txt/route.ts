import { NextResponse } from "next/server";
import { discoverPages } from "@/lib/discover-pages";

const SITE_URL = "https://jamescourson.com";

function mdUrl(route: string): string {
  if (route === "/") {
    return `${SITE_URL}/index.md`;
  }
  return `${SITE_URL}${route}.md`;
}

export async function GET() {
  const pages = await discoverPages();

  const lines: string[] = [
    "# James Courson",
    "",
    "> Personal site and portfolio. Software engineer building tools that connect people and machines.",
    "",
    `> Homepage: ${SITE_URL}`,
    "",
  ];

  for (const page of pages) {
    const title = page.title ?? page.route;
    const desc = page.description ?? "";
    const suffix = desc ? `: ${desc}` : "";
    lines.push(`- [${title}](${mdUrl(page.route)})${suffix}`);
  }

  lines.push("");

  const body = lines.join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
