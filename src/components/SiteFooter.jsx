import { Instagram, Mail, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './SiteFooter.css';

const publicFooterRoutes = new Set([
  '/',
  '/about',
  '/categories',
  '/fun-events',
  '/guidelines',
  '/faq',
  '/schedule',
]);

const links = [
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/categories', label: 'Categories' },
  { to: '/faq', label: 'FAQ' },
];

export default function SiteFooter() {
  const location = useLocation();

  if (!publicFooterRoutes.has(location.pathname)) {
    return null;
  }

  return (
    <footer className="sf-footer">
      <div className="sf-inner">
        <div className="sf-top">
          <p className="sf-brand">Lumiere 2026</p>
          <div className="sf-links">
            {links.map((item) => (
              <Link key={item.to} to={item.to} className="sf-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="sf-contact-row">
          <a className="sf-contact" href="mailto:lumiere.pec@gmail.com">
            <Mail size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>lumiere.pec@gmail.com</span>
          </a>
          <span className="sf-separator" aria-hidden="true">•</span>
          <div className="sf-contact">
            <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Punjab Engineering College, Chandigarh</span>
          </div>
          <span className="sf-separator" aria-hidden="true">•</span>
          <a
            className="sf-contact"
            href="https://www.instagram.com/lumiere_pec/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Instagram size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>@lumiere_pec</span>
          </a>
        </div>

        <div className="sf-meta-row">
          <div className="sf-bottom">Projection and Design Club, PEC Chandigarh</div>
          <div className="sf-about-socials">
            <a
              className="sf-link"
              href="https://www.instagram.com/projectionanddesignclub/"
              target="_blank"
              rel="noopener noreferrer"
            >
              @projectionanddesignclub
            </a>
            <a
              className="sf-link"
              href="https://www.instagram.com/pdc_pec/"
              target="_blank"
              rel="noopener noreferrer"
            >
              @pdc_pec
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
