const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="font-display font-bold text-lg tracking-wider text-foreground">
        <img src="/logo-text.png" alt="Lumiere" className="h-8 w-auto" />      </div>
      <div className="hidden md:flex items-center gap-10">
        <a href="#premiere" className="text-xs tracking-widest-xl text-muted-foreground hover:text-foreground transition-colors uppercase">Premiere</a>
        <a href="#retrospective" className="text-xs tracking-widest-xl text-muted-foreground hover:text-foreground transition-colors uppercase">Retrospective</a>
        <a href="#workshops" className="text-xs tracking-widest-xl text-muted-foreground hover:text-foreground transition-colors uppercase">Workshops</a>
        <a href="#journal" className="text-xs tracking-widest-xl text-muted-foreground hover:text-foreground transition-colors uppercase">Journal</a>
      </div>
      <button className="border border-foreground px-5 py-2 text-xs tracking-widest-xl text-foreground hover:bg-foreground hover:text-background transition-colors uppercase">
        Register
      </button>
    </nav>
  );
};

export default Navbar;
