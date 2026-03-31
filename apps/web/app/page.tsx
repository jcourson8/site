import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import Link from "next/link";

export const metadata = {
  title: "James Courson",
  description:
    "Innovation specialist at Brasfield & Gorrie building software that connect people and machines.",
};

function TimelineRow({
  name,
  start,
  end,
  href,
}: {
  name: string;
  start: string;
  end?: string;
  href?: string;
}) {
  const dates = (
    <span className="font-mono text-[13px] text-muted-foreground">
      {start}
      {end !== undefined && (
        <>
          {" → "}
          {end}
        </>
      )}
    </span>
  );

  if (href) {
    const isExternal = href.startsWith("http");
    const anchor = isExternal ? (
      <a
        className="text-sm underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {name}
      </a>
    ) : (
      <Link
        className="text-sm underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
        href={href}
      >
        {name}
      </Link>
    );

    return (
      <div className="flex items-baseline justify-between gap-4 py-1.5 text-muted-foreground">
        {anchor}
        {dates}
      </div>
    );
  }

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-muted-foreground">
      <span className="text-sm">{name}</span>
      {dates}
    </div>
  );
}

export default function Page() {
  return (
    <div className="mx-auto max-w-xl px-6 pt-16 pb-12 sm:pt-24">
      <header className="space-y-4">
        <h1 className="font-heading font-light text-2xl tracking-tight sm:text-3xl">
          Currently building software that connects people and machines.
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Innovation specialist at{" "}
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="https://www.brasfieldgorrie.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Brasfield &amp; Gorrie
          </a>{" "}
          creating{" "}
          <Popover>
            <PopoverTrigger
              className="cursor-help underline decoration-1 decoration-muted-foreground/40 decoration-dashed underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
              closeDelay={120}
              delay={0}
              openOnHover
            >
              Magnus
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" sideOffset={6}>
              <p className="text-muted-foreground text-xs leading-relaxed">
                B&amp;G&apos;s internal ecosystem of connected AI products
              </p>
            </PopoverContent>
          </Popover>{" "}
          and more.
        </p>
      </header>

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Work</h2>
        <div className="mt-3">
          <TimelineRow
            end="PRES"
            href="https://brasfieldgorrie.com"
            name="Brasfield & Gorrie"
            start="2025"
          />
          <TimelineRow
            href="https://r2rmovers.com"
            name="Room2Room Movers"
            start="2025"
          />
          <TimelineRow
            end="2025"
            href="https://militaryreach.auburn.edu"
            name="Military REACH"
            start="2023"
          />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Sport</h2>
        <div className="mt-3">
          <TimelineRow name="Sub 5 Miler" start="TBD" />
          <TimelineRow end="2025" name="Pole Vault" start="2014" />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Dispatch</h2>
        <div className="mt-3">
          <TimelineRow
            href="/dispatch/lattice-chunking"
            name="Lattice Chunking"
            start="IN PROGRESS"
          />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Connect</h2>
        <div className="mt-4 flex gap-5 text-muted-foreground text-sm">
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="mailto:jcourson8@gmail.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Email
          </a>
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="https://github.com/jcourson8"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="https://x.com/SharingPsyche"
            rel="noopener noreferrer"
            target="_blank"
          >
            X
          </a>
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="https://www.linkedin.com/in/james-courson/"
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
        </div>
      </section>
    </div>
  );
}
