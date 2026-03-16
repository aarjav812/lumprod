const schedule = [
  { num: "01", date: "APRIL 10", title: "THE OPENING CEREMONY & KEYNOTE", time: "18:00" },
  { num: "02", date: "APRIL 11", title: "PREMIERE SCREENINGS & PANEL", time: "14:00" },
  { num: "03", date: "APRIL 12", title: "GRAND FINALE & AWARD NIGHT", time: "19:00" },
];

const ProgramSection = () => {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-8">
        <p className="text-xs tracking-widest-xl text-gold mb-6 uppercase">Festival Program</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20">
          <h2 className="font-display font-bold text-5xl md:text-7xl text-foreground leading-[0.95]">
            CHRONICLES<br />OF LUMIERE
          </h2>
          <p className="font-serif italic text-sm text-gold-muted mt-4 md:mt-0 max-w-xs">
            THREE DAYS OF CINEMATIC IMMERSION AND TECHNICAL MASTERY.
          </p>
        </div>

        <div className="space-y-2">
          {schedule.map((item, i) => (
            <div
              key={item.num}
              className={`card-glow p-8 md:p-10 flex items-center gap-6 md:gap-12 ${i === 0 ? 'bg-gradient-warm' : ''}`}
            >
              <span className="font-display font-bold text-3xl md:text-5xl text-accent/60">{item.num}</span>
              <span className="text-xs tracking-widest-xl text-accent uppercase hidden md:block">{item.date}</span>
              <h3 className="font-display font-bold text-lg md:text-2xl text-foreground flex-1 text-center">
                {item.title}
              </h3>
              <span className="text-xs tracking-widest text-muted-foreground font-mono">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;
