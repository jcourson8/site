// Turbopack requires MDX loader options to be serializable, so rehype plugins
// are referenced by module path (the @next/mdx loader resolves + imports them
// at load time) rather than as imported function values.
/** @type {import('@next/mdx').MDXOptions} */
export const mdxOptions = {
  rehypePlugins: [
    [
      "@shikijs/rehype",
      {
        // Dual themes emit per-mode CSS variables (--shiki-light / --shiki-dark)
        // on tokens instead of a fixed color, so the block can adapt to the
        // app's light/dark theme. defaultColor:false keeps shiki from baking a
        // hardcoded background onto <pre>; the surface is set in globals.css.
        // Note: the key is `themes` (plural) — `theme` with an object silently
        // produces no highlighting.
        themes: { light: "rose-pine-dawn", dark: "rose-pine" },
        defaultColor: false,
      },
    ],
  ],
};
