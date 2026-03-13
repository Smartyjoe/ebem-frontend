import { Link } from 'react-router';
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { trackAffiliateCtaClick } from '../services/affiliate';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Earn With Us', href: '/earn' },
];

const SERVICES = [
  'Nigeria Ready Stock',
  'China Pre-Order',
  'Bulk & Wholesale Sourcing',
  'Manufacturer Pricing',
  'Logistics & Customs',
  'Dropshipping Support',
  'AI Product Search',
  'Trade Consulting',
];

const POLICY_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Refund & Return Policy', href: '/refund-return-policy' },
  { label: 'Delivery Policy', href: '/delivery-policy' },
];

export function Footer() {
  const { openPanel } = useApp();

  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <img
              src="/assets/ebem-logo-white.png"
              alt="Ebem Global"
              className="h-10 w-auto mb-5"
            />
            <p className="text-white/50 text-sm leading-relaxed mb-6" style={{ fontFamily: 'var(--font-body)' }}>
              We connect Africa directly to Chinese manufacturers. Factory prices. Zero middlemen. Real trade.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: 'https://www.facebook.com/share/1GJB6mkFSP/?mibextid=wwXIfr', label: 'Facebook' },
                { Icon: MessageCircle, href: 'https://chat.whatsapp.com/HWaDDuJvR0dB6w7omjEDxv?mode=gi_t', label: 'WhatsApp Group' },
                { Icon: Instagram, href: 'https://www.instagram.com/ebemglobal?igsh=MWdrdWh3bDEwcDQzMA%3D%3D&utm_source=qr', label: 'Instagram' },
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center hover:border-white hover:bg-white hover:text-black transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4
              className="text-white/40 text-xs uppercase tracking-[0.25em] mb-5"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => {
                      if (link.href === '/earn') trackAffiliateCtaClick('footer_earn_with_us');
                    }}
                    className="text-white/60 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => openPanel('request')}
                  className="text-white/60 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Request a Product
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h4
              className="text-white/40 text-xs uppercase tracking-[0.25em] mb-5"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICES.map(service => (
                <li key={service}>
                  <span
                    className="text-white/60 text-sm"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4
              className="text-white/40 text-xs uppercase tracking-[0.25em] mb-5"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                  Nigeria (Head Office)<br />China Operations Active
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                <a href="tel:+2348154561953" className="text-white/60 hover:text-white text-sm transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
                  +234 815 456 1953
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                <a href="mailto:Ebemglobal@gmail.com" className="text-white/60 hover:text-white text-sm transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
                  Ebemglobal@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-xs mb-3" style={{ fontFamily: 'var(--font-body)' }}>Subscribe to trade updates</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors rounded-none"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
                <button
                  className="px-4 py-2.5 bg-white text-black text-xs uppercase tracking-wide hover:bg-gray-200 transition-colors"
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Bottom strip */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
            © 2026 Ebem Global. All Rights Reserved. Making Global Trade Easy, Direct, and Profitable.
          </p>
          <div className="flex items-center gap-6">
            {POLICY_LINKS.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="text-white/30 hover:text-white/60 text-xs transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
