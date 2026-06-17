import Hero from "@/components/landing/Hero";
import AboutSection from "@/components/landing/AboutSection";
import HowItWorks from "@/components/landing/HowItWorks";
import RouteCarousel from "@/components/landing/RouteCarousel";
import KgstdSection from "@/components/landing/KgstdSection";
import ContactCTA from "@/components/landing/ContactCTA";

export default function Home() {
  return (
    <div className="bg-[#0A1017]">
      <Hero />
      <AboutSection />
      <HowItWorks />
      <RouteCarousel />
      <KgstdSection />
      <ContactCTA />
    </div>
  );
}
