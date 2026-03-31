import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const STRING_LITERAL = /^["'`]([\s\S]*?)["'`]$/;

function stripMdxNodes() {
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }

      const n = node as unknown as Record<string, unknown>;
      const siblings = (parent as unknown as { children: unknown[] }).children;

      if (n.type === "mdxjsEsm") {
        siblings.splice(index, 1);
        return index;
      }

      if (n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement") {
        const attrs = (n.attributes ?? []) as {
          name?: string;
          value?: unknown;
        }[];
        const labelAttr = attrs.find((a) => a.name === "label");
        if (typeof labelAttr?.value === "string") {
          siblings.splice(index, 1, {
            type: "text",
            value: labelAttr.value,
          });
          return index;
        }

        const kids = (n.children ?? []) as unknown[];
        if (kids.length === 0) {
          siblings.splice(index, 1);
          return index;
        }

        siblings.splice(index, 1, ...kids);
        return index;
      }

      if (n.type === "mdxFlowExpression" || n.type === "mdxTextExpression") {
        const raw = String(n.value ?? "");
        const m = STRING_LITERAL.exec(raw);
        if (m) {
          siblings.splice(index, 1, { type: "text", value: m[1] });
        } else {
          siblings.splice(index, 1);
        }
        return index;
      }
    });
  };
}

export async function mdxToMarkdown(mdxSource: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(stripMdxNodes)
    .use(remarkStringify)
    .process(mdxSource);

  return String(file).trim();
}
