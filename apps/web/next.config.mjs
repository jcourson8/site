import createMDX from "@next/mdx";

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

const withMDX = createMDX();

export default withMDX(nextConfig);
