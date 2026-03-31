import katex from "katex";
import "katex/dist/katex.min.css";

export function Tex({
  display,
  children,
}: {
  display?: boolean;
  children: string;
}) {
  const html = katex.renderToString(children, {
    displayMode: display ?? false,
    throwOnError: false,
  });
  return (
    <span
      className={display ? "my-6 flex justify-center px-4" : undefined}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: katex output is trusted
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
