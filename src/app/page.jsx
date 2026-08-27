import Header from "@/components/Header"
import HeroSection from "@/components/HeroSection"
import ProgramsSection from "@/components/ProgramsSection"
import AboutSection from "@/components/AboutSection"
import ScrollProgress from "@/components/ScrollProgress"
import PartnersStrip from "@/components/PartnersStrip"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import NewsletterSection from "@/components/NewsletterSection"
import Footer from "@/components/Footer"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import CTASection from "@/components/CTASection"
import LatestPostsBlock from "@/components/blog/LatestPostsBlock"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection />
        <PartnersStrip />
        <ProgramsSection />
        <AboutSection />
        <TestimonialsCarousel />
        <LatestPostsBlock />
        <CTASection />
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}
