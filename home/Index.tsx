import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import AboutSection from "@/components/AboutSection";
import ValuesSection from "@/components/ValuesSection";
import ProgramSection from "@/components/ProgramSection";
import ShowcasesSection from "@/components/ShowcasesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      <ValuesSection />
      <ProgramSection />
      <ShowcasesSection />
    </div>
  );
};

export default Index;
