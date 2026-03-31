import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const MDX_NODE_TYPES = new Set([
  "mdxjsEsm",
  "mdxJsxFlowElement",
  "mdxJsxTextElement",
  "mdxFlowExpression",
  "mdxTextExpression",
]);

function stripMdxNodes() {
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }
      if (MDX_NODE_TYPES.has(node.type)) {
        (parent as { children: unknown[] }).children.splice(index, 1);
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
