const AboutSection = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="text-xs tracking-widest-xl text-muted-foreground mb-6 uppercase">PDC Legacy</p>
            <h2 className="font-display font-bold text-5xl md:text-7xl text-foreground leading-[0.95]">
              THE<br />
              PROJECTION<br />
              <span className="text-muted-foreground">& DESIGN</span><br />
              <span className="text-muted-foreground">CLUB</span>
            </h2>
          </div>

          {/* Right */}
          <div className="pt-4">
            <p className="text-secondary-foreground/70 text-lg leading-relaxed mb-10">
              Lumiere is the flagship celebration of fresh cinematic
              talent at PEC. Under the guidance of the Secretariat,
              we nurture the next generation of visual architects.
            </p>

            <div className="space-y-0">
              <div className="card-glow p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-display font-semibold text-muted-foreground">
                  AC
                </div>
                <div>
                  <p className="text-xs tracking-widest-xl text-muted-foreground uppercase">The Secretary</p>
                  <p className="font-display font-bold text-foreground">AYUSH CHAUHAN</p>
                </div>
              </div>
              <div className="card-glow p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-display font-semibold text-muted-foreground">
                  HK
                </div>
                <div>
                  <p className="text-xs tracking-widest-xl text-muted-foreground uppercase">Joint Secretary</p>
                  <p className="font-display font-bold text-foreground">HITESH KOCCHAR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
