import { Camera, Layers, Monitor } from "lucide-react";

const values = [
  {
    icon: Camera,
    title: "CINEMATIC INTEGRITY",
    description: "Preserving the grain and grit of traditional filmmaking in a digital age.",
  },
  {
    icon: Layers,
    title: "VISUAL NARRATIVE",
    description: "A focus on stories that challenge the status quo and ignite change.",
  },
  {
    icon: Monitor,
    title: "GLOBAL REACH",
    description: "Connecting filmmakers across borders through shared visual language.",
  },
];

const ValuesSection = () => {
  return (
    <section className="py-32 bg-gradient-dark">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div key={v.title} className="card-glow p-10">
              <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center mb-8">
                <v.icon className="w-5 h-5 text-gold-muted" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
