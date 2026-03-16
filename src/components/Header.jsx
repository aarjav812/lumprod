import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../AuthContext";
import { prefetchRoute } from "../App";
import { lockBodyScroll, unlockBodyScroll } from "../utils/dom";
import "./Header.css";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/fun-events", label: "Fun Events" },
  { href: "/categories", label: "Categories" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/faq", label: "FAQ" },
];

const handlePrefetch = (href) => {
  prefetchRoute(href);
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [location.pathname]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    lockBodyScroll();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className={`header ${isHomePage ? "header-home" : ""} ${(!isHomePage || scrolled) ? "header-visible" : ""}`}>
      <div className="header-container">

        <Link
          to="/"
          className="header-logo"
          onClick={handleHomeClick}
        >
          <span className="logo-text" aria-label="Lumiere 2026">Lumiere'26</span>
        </Link>


        {/* DESKTOP NAV */}
        <nav className="header-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onMouseEnter={() => handlePrefetch(link.href)}
              onFocus={() => handlePrefetch(link.href)}
              className={`nav-link ${location.pathname === link.href ? "active" : ""
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="header-actions">
          {user ? (
            <Link to="/dashboard" className="cta-stack cta-stack-dashboard" aria-label="Dashboard">
              <span className="cta-label">Dashboard</span>
            </Link>
          ) : (
            <Link to="/register" className="cta-stack" aria-label="Sign up">
              <span className="cta-label">Sign Up</span>
            </Link>
          )}
        </div>
      </div>

      <button
        className={`mobile-popup-btn ${mobileMenuOpen ? "is-open" : ""}`}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div
        className={`mobile-menu-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* MOBILE MENU */}
      <div className={`mobile-menu mobile-popup ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-inner">
          <div className="mobile-menu-head">
            <Link
              to="/"
              className="header-logo"
              onClick={handleHomeClick}
            >
              <span className="logo-text" aria-label="Lumiere 2026">Lumiere'26</span>
            </Link>
          </div>

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onMouseEnter={() => handlePrefetch(link.href)}
              onFocus={() => handlePrefetch(link.href)}
              className={`nav-link ${location.pathname === link.href ? "active" : ""
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mobile-divider" />

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}
