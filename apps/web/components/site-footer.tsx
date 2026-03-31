import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { TomoToggle } from "@/components/tomo-toggle";

export function SiteFooter() {
  return (
    <footer className="shrink-0 bg-background">
      <div className="flex h-6 items-center justify-between px-3 font-mono text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            James Courson
            <TomoToggle />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger className="cursor-pointer transition-opacity duration-150 hover:opacity-60">
              Inspiration
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-48 p-2"
              side="top"
              sideOffset={8}
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
                    className="rounded-md px-2 py-1 text-muted-foreground text-xs transition-colors duration-150 hover:bg-accent hover:text-foreground"
                    href={href}
                    key={href}
                    rel="noopener noreferrer"
                    target="_blank"
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
  );
}
