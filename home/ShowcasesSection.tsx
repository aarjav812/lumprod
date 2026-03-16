import filmCity from "@/assets/film-city.jpg";
import filmMic from "@/assets/film-mic.jpg";
import { Play } from "lucide-react";

const ShowcasesSection = () => {
  return (
    <section id="premiere" className="py-32 bg-gradient-dark">
      <div className="container mx-auto px-8">
        <h2 className="font-display font-bold text-5xl md:text-7xl text-foreground mb-16 leading-[0.95]">
          PREMIERE<br />SHOWCASES
        </h2>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Main film card */}
          <div className="md:col-span-3 relative group overflow-hidden rounded-lg">
            <img src={filmCity} alt="Metropolis Redefined" className="w-full h-full object-cover min-h-[400px]" />
            <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
            <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Play className="w-5 h-5 text-accent-foreground fill-current" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-xs tracking-widest-xl text-muted-foreground mb-2 uppercase">International Selection</p>
              <h3 className="font-display font-bold text-3xl md:text-4xl text-accent">
                METROPOLIS<br />REDEFINED
              </h3>
              <div className="flex gap-4 mt-4">
                <span className="text-xs tracking-widest text-foreground border-b border-foreground pb-1 uppercase cursor-pointer hover:text-primary transition-colors">View Film</span>
                <span className="text-xs tracking-widest text-muted-foreground uppercase cursor-pointer hover:text-foreground transition-colors">Details</span>
              </div>
            </div>
          </div>

          {/* Side card */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-lg">
            <img src={filmMic} alt="Void Echoes" className="w-full h-full object-cover min-h-[400px]" />
            <div className="absolute inset-0 bg-background/50 group-hover:bg-background/30 transition-colors" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-xs tracking-widest-xl text-muted-foreground mb-2 uppercase">Experimental</p>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-foreground">VOID ECHOES</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                A sensory exploration into the silence of modern urban landscapes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcasesSection;
