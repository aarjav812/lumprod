const categories = [
  { count: "12", label: "FILMS", name: "FICTION" },
  { count: "08", label: "FILMS", name: "DOCUMENTARY" },
  { count: "05", label: "FILMS", name: "EXPERIMENTAL", highlight: true },
  { count: "04", label: "FILMS", name: "ANIMATION" },
];

const CategoriesSection = () => {
  return (
    <section className="py-32 bg-gradient-dark">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <div key={cat.name} className="text-center group cursor-pointer">
              <p className={`text-xs tracking-widest-xl mb-3 uppercase ${cat.highlight ? 'text-accent' : 'text-muted-foreground'}`}>
                {cat.count} {cat.label}
              </p>
              <h3 className="font-display font-bold text-2xl md:text-4xl text-foreground group-hover:text-gradient-gold transition-colors">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
