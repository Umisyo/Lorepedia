import { HeroSection } from "@/components/features/landing/HeroSection"
import { FeatureSection } from "@/components/features/landing/FeatureSection"
import { CTASection } from "@/components/features/landing/CTASection"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <FeatureSection />
      <CTASection />
    </div>
  )
}
