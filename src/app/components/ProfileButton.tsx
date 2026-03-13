import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackAffiliateCtaClick } from '../services/affiliate';

export function ProfileButton() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [open]);

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        to="/account"
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-gray-700"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
      >
        <LogIn size={15} />
        <span className="text-xs uppercase tracking-wider hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const first = user.firstName?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U';
  const last = user.lastName?.[0] ?? '';
  const initials = (first + last).toUpperCase();
  const displayName = user.firstName ? user.firstName : user.displayName ?? 'Profile';
  const affiliateUrl = '/earn';

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((current) => !current)}
        className="group inline-flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-black transition-all duration-200"
        style={{ fontFamily: 'var(--font-body)' }}
        title={`Signed in as ${user.email}`}
      >
        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
          {initials}
        </div>
        <span className="text-xs font-semibold text-gray-800 group-hover:text-black hidden sm:inline truncate max-w-[80px]">
          {displayName}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] p-2 z-40">
          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            My Account
          </Link>
          <a
            href={affiliateUrl}
            onClick={() => {
              trackAffiliateCtaClick('account_dropdown');
              setOpen(false);
            }}
            className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Become an Affiliate
          </a>
        </div>
      )}
    </div>
  );
}
