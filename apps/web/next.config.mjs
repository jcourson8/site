import createMDX from "@next/mdx";

import { mdxOptions } from "./mdx.config.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return [
      {
        source: "/index.md",
        destination: "/api/md/index",
      },
      {
        source: "/:path(.*)\\.md",
        destination: "/api/md/:path",
      },
    ];
  },
};

const withMDX = createMDX({ options: mdxOptions });

export default withMDX(nextConfig);
