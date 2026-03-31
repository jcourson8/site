import Link from "next/link";

export default function DispatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="relative mx-auto max-w-xl px-6 pt-16 pb-12 sm:pt-24">
          <article className="relative">
            <Link
              className="absolute top-[0.60em] -left-10 hidden text-muted-foreground transition-opacity duration-150 hover:opacity-60 lg:block"
              href="/"
            >
              <svg
                aria-label="Back to home"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path d="M21 12H3M3 12L10 5M3 12L10 19" />
              </svg>
            </Link>
            {children}
          </article>
        </div>
      </main>
    </div>
  );
}
