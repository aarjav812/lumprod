import heroBg from "@/assets/hero-bg.jpg";
import { Calendar, MapPin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Cinematic clapperboard" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 mt-16">
        <p className="text-xs tracking-widest-xl text-muted-foreground mb-8 uppercase">
          Punjab Engineering College • PDC Presents
        </p>
        <h1 className="font-display font-bold text-7xl md:text-[10rem] leading-[0.85] tracking-tight text-foreground mb-4">
          LUMIERE
        </h1>
        <p className="font-serif italic text-4xl md:text-6xl text-gradient-gold mb-10">
          film festival
        </p>
        <p className="max-w-2xl mx-auto text-secondary-foreground/70 text-base md:text-lg leading-relaxed mb-14">
          The definitive gathering of cinematic visionaries. Explore the boundaries
          of visual storytelling through short films, workshops, and the legendary
          Design Showdown.
        </p>
        <div className="flex items-center justify-center gap-8 text-xs tracking-widest-xl text-muted-foreground uppercase">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            April 10 — 12, 2026
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            PEC, Chandigarh
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
