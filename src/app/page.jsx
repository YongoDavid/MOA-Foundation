import HeroSection from "@/components/HeroSection"
import ProgramsSection from "@/components/ProgramsSection"
import AboutSection from "@/components/AboutSection"
import PartnersStrip from "@/components/PartnersStrip"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import NewsletterSection from "@/components/NewsletterSection"
import CTASection from "@/components/CTASection"
import LatestPostsBlock from "@/components/blog/LatestPostsBlock"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <>
        <HeroSection />
        <PartnersStrip />
        <ProgramsSection />
        <AboutSection />
        <TestimonialsCarousel />
        <LatestPostsBlock />
        <CTASection />
        <NewsletterSection />
      </>
    </div>
  )
}
