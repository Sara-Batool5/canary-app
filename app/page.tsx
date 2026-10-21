import { Faq } from '@/components/landing/faq'
import { Features } from '@/components/landing/features'
import { FinalCta } from '@/components/landing/final-cta'
import { Footer } from '@/components/landing/footer'
import { HealthExplainer } from '@/components/landing/health-explainer'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { LandingBackground } from '@/components/landing/landing-background'
import { Navbar } from '@/components/landing/navbar'
import { SocialProof } from '@/components/landing/social-proof'

export default function Home() {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip">
      <LandingBackground />
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <HealthExplainer />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
