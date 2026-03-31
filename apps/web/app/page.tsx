import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

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
    return (
      <div className="flex items-baseline justify-between gap-4 py-1.5 text-muted-foreground">
        <a
          className="text-sm transition-opacity duration-150 hover:text-foreground"
          href={href}
        >
          {name}
        </a>
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
            className="text-foreground underline decoration-1 decoration-muted-foreground underline-offset-4"
            href="https://www.brasfieldgorrie.com"
          >
            Brasfield &amp; Gorrie
          </a>{" "}
          creating{" "}
          <Popover>
            <PopoverTrigger
              className="cursor-help text-foreground underline decoration-1 decoration-muted-foreground/40 decoration-dashed underline-offset-4"
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

      {/* <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Present</h2>
        <div className="mt-4 space-y-3 text-muted-foreground text-sm leading-relaxed">
          <p>
            Thinking about how agents interact with design systems. Building
            tools that let machines write better code by giving them better
            primitives.
          </p>
          <p>
            Reading about typography. Trying to write more. Learning to leave
            things out.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Dispatch</h2>
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-4 py-1.5 text-muted-foreground">
            <Link
              className="text-sm transition-opacity duration-150 hover:text-foreground"
              href="/dispatch/agents-and-design-systems"
            >
              Agents and Design Systems
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Craft</h2>
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Interaction experiments and animation studies. A place to work in
          public.{" "}
          <Link
            className="text-foreground underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-opacity duration-150 hover:opacity-60"
            href="/craft/dither"
          >
            Dither studio
          </Link>
          .
        </p>
      </section> */}

      <section className="mt-14">
        <h2 className="font-medium text-foreground text-sm">Connect</h2>
        <div className="mt-4 flex gap-5 text-sm">
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="mailto:jcourson@brasfieldgorrie.com"
          >
            Email
          </a>
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="https://github.com"
          >
            GitHub
          </a>
          <a
            className="underline decoration-1 decoration-muted-foreground/40 underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
            href="https://www.linkedin.com"
          >
            LinkedIn
          </a>
        </div>
      </section>
    </div>
  );
}
