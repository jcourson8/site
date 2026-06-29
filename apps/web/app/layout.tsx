import { Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { TomoLayout } from "@/components/tomo-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const gtCanon = localFont({
  src: "../public/fonts/gt-canon/GT-Canon-L-Standard-Light.woff2",
  variable: "--font-display",
  display: "swap",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        inter.variable,
        gtCanon.variable,
        fontMono.variable
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex h-dvh flex-col overflow-hidden">
        <ThemeProvider>
          <main className="flex-1 overflow-y-auto overscroll-contain">
            <ScrollToTop />
            {children}
          </main>
          <SiteFooter />
          <TomoLayout />
        </ThemeProvider>
      </body>
    </html>
  );
}
