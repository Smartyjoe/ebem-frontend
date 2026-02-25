import { Link } from 'react-router';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProfileButton() {
  const { user } = useAuth();
  if (!user) {
    return (
      <Link to="/account" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50">
        <User size={18} /> <span className="hidden md:inline">Account</span>
      </Link>
    );
  }
  const initials = `${user.firstName?.[0]||user.displayName?.[0]||'U'}${user.lastName?.[0]||''}`.toUpperCase();
  return (
    <Link to="/account" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50">
      <div className="w-6 h-6 rounded-full bg-black text-white grid place-items-center text-[11px]">{initials}</div>
      <span className="hidden md:inline">Profile</span>
    </Link>
  );
}
