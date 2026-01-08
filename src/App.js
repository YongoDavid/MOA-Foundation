import "./App.css"
import Header from "./components/Header"
import HeroSection from "./components/HeroSection"
import ProgramsSection from "./components/ProgramsSection"
import AboutSection from "./components/AboutSection"
// import TestimonialsCarousel from "./components/TestimonialsCarousel"
import NewsletterSection from "./components/NewsletterSection"
import Footer from "./components/Footer"
import ScrollToTopButton from "./components/ScrollToTopButton"

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ProgramsSection />
        <AboutSection />
        {/* <TestimonialsCarousel /> */}
        <NewsletterSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}

export default App
