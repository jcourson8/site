import { DitherStudio } from "@/components/dither/dither-studio";

export const metadata = {
  title: "Dither — Craft",
  description:
    "Ordered dithering WebGL studio. Generate patterns or apply dithering to images.",
  draft: true,
};

export default function DitherPage() {
  return <DitherStudio />;
}
