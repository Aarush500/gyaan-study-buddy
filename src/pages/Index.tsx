import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ChapterPreview from "@/components/landing/ChapterPreview";
import Pricing from "@/components/landing/Pricing";
import Languages from "@/components/landing/Languages";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Features />
      <ChapterPreview />
      <Languages />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
};

export default Index;
