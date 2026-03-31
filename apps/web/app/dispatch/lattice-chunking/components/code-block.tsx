interface CodeBlockProps {
  children: string;
  filename?: string;
  lang?: string;
}

export function CodeBlock({ children, filename }: CodeBlockProps) {
  return (
    <div className="my-6 overflow-hidden rounded-lg border border-border">
      {filename && (
        <div className="border-border border-b bg-muted/50 px-4 py-2 font-mono text-[11px] text-muted-foreground">
          {filename}
        </div>
      )}
      <pre className="overflow-x-auto bg-muted/30 p-4 font-mono text-[13px] text-foreground/90 leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}
