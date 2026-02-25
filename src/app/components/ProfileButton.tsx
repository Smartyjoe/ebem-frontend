import { Link } from 'react-router';
import { User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfileButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
    );
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

  // Build initials from name or email
  const first = user.firstName?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U';
  const last  = user.lastName?.[0] ?? '';
  const initials = (first + last).toUpperCase();

  // Build display name
  const displayName = user.firstName
    ? user.firstName
    : user.displayName ?? 'Profile';

  return (
    <Link
      to="/account"
      className="group inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-gray-200 bg-white hover:border-black transition-all duration-200"
      style={{ fontFamily: 'var(--font-body)' }}
      title={`Signed in as ${user.email}`}
    >
      {/* Avatar circle */}
      <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
        {initials}
      </div>
      {/* Name — hidden on very small screens */}
      <span className="text-xs font-semibold text-gray-800 group-hover:text-black hidden sm:inline truncate max-w-[80px]">
        {displayName}
      </span>
    </Link>
  );
}
