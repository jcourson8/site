import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="font-heading text-2xl tracking-tight sm:text-3xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 font-medium text-foreground text-sm">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 font-medium text-foreground text-sm">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        className="text-foreground underline decoration-1 underline-offset-4 transition-opacity duration-150 hover:opacity-60"
        href={href}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 list-inside list-disc space-y-1 text-muted-foreground text-sm leading-relaxed">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 list-inside list-decimal space-y-1 text-muted-foreground text-sm leading-relaxed">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mt-4 border-border border-l-2 pl-4 text-muted-foreground text-sm italic leading-relaxed">
        {children}
      </blockquote>
    ),
    code: ({ children }) => {
      // Inline code only: fenced blocks render highlighted <span>s (not a plain
      // string), so pass those through untouched to keep shiki's token colors.
      if (typeof children !== "string") {
        return <code>{children}</code>;
      }
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">
          {children}
        </code>
      );
    },
    pre: ({ children, className, style }) => (
      <pre
        className={`mt-6 overflow-x-auto rounded-lg p-4 font-mono text-[13px] leading-relaxed${
          className ? ` ${className}` : ""
        }`}
        style={style}
      >
        {children}
      </pre>
    ),
    hr: () => <hr className="my-10 border-border" />,
    ...components,
  };
}
