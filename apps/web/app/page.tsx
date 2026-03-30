import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@workspace/ui/components/popover"
import Link from "next/link"

const glyphs = {
  solid: "■",
  dot: "⊡",
  cross: "⊠",
  minus: "⊟",
  plus: "⊞",
} as const

type GlyphName = keyof typeof glyphs

function Glyph({ name }: { name: GlyphName }) {
  return (
    <span aria-hidden className="relative -top-[0.05em] inline-block leading-none">
      {glyphs[name]}
    </span>
  )
}

function TimelineRow({
  name,
  start,
  end,
  href,
}: {
  name: string
  start: string
  end?: string
  href?: string
}) {
  const dates = (
    <span className="font-mono text-xs text-muted-foreground">
      {start}
      {end !== undefined && (
        <>
          {" → "}
          {end}
        </>
      )}
    </span>
  )

  if (href) {
    return (
      <div className="flex items-baseline justify-between gap-4 py-1.5">
        <a
          href={href}
          className="text-sm transition-opacity duration-150 hover:opacity-60"
        >
          {href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
        {dates}
      </div>
    )
  }

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm">{name}</span>
      {dates}
    </div>
  )
}

export default function Page() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-xl px-6 pb-12 pt-16 sm:pt-24">
        <header className="space-y-4">
          <h1 className="font-heading text-2xl font-light tracking-tight sm:text-3xl">
            Currently building software that connects people and machines.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Innovation specialist at{" "}
            <a
              href="https://www.brasfieldgorrie.com"
              className="text-foreground underline decoration-1 underline-offset-4"
            >
              Brasfield &amp; Gorrie
            </a>
            {" "}creating{" "}
            <Popover>
              <PopoverTrigger
                openOnHover
                delay={0}
                closeDelay={120}
                className="cursor-help text-foreground underline decoration-muted-foreground/40 decoration-dashed decoration-1 underline-offset-4"
              >
                Magnus
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" sideOffset={6}>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  B&amp;G&apos;s internal ecosystem of connected AI products
                </p>
              </PopoverContent>
            </Popover>
            {" "}and more.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-muted-foreground">Work</h2>
          <div className="mt-3">
            <TimelineRow name="Brasfield & Gorrie" start="2025" end="...." href="https://brasfieldgorrie.com" />
            <TimelineRow name="Room2Room Movers" start="2025" href="https://r2rmovers.com" />
            <TimelineRow name="Military REACH" start="2023" end="2025" href="https://militaryreach.auburn.edu" />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-muted-foreground">Sport</h2>
          <div className="mt-3">
            <TimelineRow name="Sub 5 Miler" start="TBD" />
            <TimelineRow name="Pole Vault" start="2014" end="2025" />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-muted-foreground">Now</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Thinking about how agents interact with design systems.
              Building tools that let machines write better code by
              giving them better primitives.
            </p>
            <p>
              Reading about typography. Trying to write more. Learning
              to leave things out.
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-muted-foreground">Craft</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Interaction experiments and animation studies.
            A place to work in public.{" "}
            <Link
              href="/craft/dither"
              className="text-foreground underline decoration-muted-foreground/40 decoration-1 underline-offset-4 transition-opacity duration-150 hover:opacity-60"
            >
              Dither playground
            </Link>
            .
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-muted-foreground">Connect</h2>
          <div className="mt-4 flex gap-5 text-sm">
            <a
              href="mailto:james@courson.dev"
              className="underline decoration-muted-foreground/40 decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            >
              Email
            </a>
            <a
              href="#"
              className="underline decoration-muted-foreground/40 decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            >
              GitHub
            </a>
            <a
              href="#"
              className="underline decoration-muted-foreground/40 decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            >
              LinkedIn
            </a>
          </div>
        </section>
        </div>
      </main>

      <footer className="shrink-0 bg-background">
        <div className="flex h-6 items-center justify-between px-3 font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              James Courson
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger className="cursor-pointer transition-opacity duration-150 hover:opacity-60">
                Inspiration
              </PopoverTrigger>
              <PopoverContent
                side="top"
                sideOffset={8}
                align="end"
                className="w-48 p-2"
              >
                <nav className="flex flex-col gap-0.5">
                  {[
                    { href: "https://p.cv", label: "p.cv" },
                    { href: "https://paco.me", label: "paco.me" },
                    { href: "https://works.pm", label: "works.pm" },
                    { href: "https://emilkowal.ski", label: "emilkowal.ski" },
                    { href: "https://code.storage", label: "code.storage" },
                    { href: "https://ui.land", label: "ui.land" },
                    { href: "https://jakub.kr/", label: "jakub.kr" },
                  ].map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </footer>
    </div>
  )
}
