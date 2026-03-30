import localFont from "next/font/local"
import { Inter, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const gtCanon = localFont({
  src: [
    {
      path: "../public/fonts/gt-canon/GT-Canon-Trial-VF.woff2",
      style: "normal",
    },
    {
      path: "../public/fonts/gt-canon/GT-Canon-Italic-Trial-VF.woff2",
      style: "italic",
    },
  ],
  variable: "--font-display",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        inter.variable,
        gtCanon.variable,
        fontMono.variable,
      )}
    >
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
