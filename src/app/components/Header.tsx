import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ShoppingBag, Search, Package, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Blog', href: '/blog' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openPanel, cartCount } = useApp();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const isHome = location.pathname === '/';
  const isDark = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
          scrolled
            ? 'bg-white shadow-sm border-b border-gray-100'
            : isHome
            ? 'bg-transparent'
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span
                className={`transition-colors duration-500 ${isDark ? 'text-white' : 'text-black'}`}
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', letterSpacing: '0.08em', lineHeight: 1 }}
              >
                NEXBRIDGE
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-xs uppercase tracking-widest transition-colors duration-300 hover:opacity-60 ${
                    location.pathname === link.href
                      ? isDark ? 'text-white' : 'text-black'
                      : isDark ? 'text-white/80' : 'text-gray-600'
                  } ${location.pathname === link.href ? 'border-b border-current pb-0.5' : ''}`}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* AI Search */}
              <button
                onClick={() => openPanel('search')}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${
                  isDark
                    ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Search</span>
              </button>

              {/* Request Product */}
              <button
                onClick={() => openPanel('request')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-200 hover:scale-[1.02] ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Request</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => openPanel('cart')}
                className={`relative w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-[1.05] ${
                  isDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center border-2 border-white" style={{ fontSize: '9px' }}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                  isDark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-gray-100'
                }`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-20 bg-white transition-all duration-400 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        <div className="flex flex-col h-full pt-24 px-8">
          <nav className="space-y-1">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-4 border-b border-gray-100 text-gray-900 hover:text-gray-500 transition-colors"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  transitionDelay: `${i * 50}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => { openPanel('request'); setMobileOpen(false); }}
              className="flex-1 py-3 bg-black text-white text-xs uppercase tracking-widest rounded-full"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              Request Product
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
