import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, LogOut, Mail, MapPin, Phone, Shield, User, User2 } from 'lucide-react';

export default function Account() {
  const { user, loading, login, register, updateProfile, logout, requestPassword } = useAuth();
  const [tab, setTab] = useState<'login'|'register'|'profile'>('login');

  useEffect(() => { if (user) setTab('profile'); }, [user]);

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Your Account</h1>
      <p className="text-gray-500 mb-6">Manage your profile details and view your recent orders.</p>

      {!user ? (
        <Unauthed tab={tab} setTab={setTab} onLogin={login} onRegister={register} onForgot={requestPassword} />
      ) : (
        <Authed onLogout={logout} onUpdate={updateProfile} />
      )}
    </section>
  );
}

function Unauthed({ tab, setTab, onLogin, onRegister, onForgot }:
  { tab: 'login'|'register'; setTab: (v:'login'|'register')=>void; onLogin: (e:string,p:string)=>Promise<void>;
    onRegister: (i:{email:string;password:string;firstName?:string;lastName?:string})=>Promise<void>; onForgot:(e:string)=>Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirst] = useState('');
  const [lastName, setLast] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="border rounded-xl p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={()=>setTab('login')} className={`px-4 py-2 rounded ${tab==='login'?'bg-black text-white':'bg-gray-100'}`}>Login</button>
          <button onClick={()=>setTab('register')} className={`px-4 py-2 rounded ${tab==='register'?'bg-black text-white':'bg-gray-100'}`}>Register</button>
        </div>

        {tab==='login' ? (
          <form onSubmit={async (e)=>{ e.preventDefault(); setBusy(true); setMessage(null); try { await onLogin(email,password); } catch(err:any){ setMessage(err.message||'Login failed'); } finally { setBusy(false);} }} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input label="Password" type="password" value={password} onChange={setPassword} required />
            <button disabled={busy} className="w-full bg-black text-white py-3 rounded-lg">{busy?'Signing in...':'Sign In'}</button>
            <button type="button" onClick={async()=>{ if(!email) return setMessage('Enter your email first'); setBusy(true); try{ await onForgot(email); setMessage('If your email exists, a reset link has been sent.'); } finally{ setBusy(false);} }} className="w-full text-sm text-gray-600 underline">Forgot password?</button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        ) : (
          <form onSubmit={async (e)=>{ e.preventDefault(); setBusy(true); setMessage(null); try { await onRegister({ email, password, firstName, lastName }); } catch(err:any){ setMessage(err.message||'Registration failed'); } finally { setBusy(false);} }} className="space-y-4">
            <Input label="First name" value={firstName} onChange={setFirst} />
            <Input label="Last name" value={lastName} onChange={setLast} />
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input label="Password" type="password" value={password} onChange={setPassword} required />
            <button disabled={busy} className="w-full bg-black text-white py-3 rounded-lg">{busy?'Creating account...':'Create account'}</button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        )}
      </div>

      <div className="bg-black text-white rounded-xl p-6">
        <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Why create an account?</h3>
        <ul className="text-sm space-y-2 text-white/80">
          <li>• Track your orders and deliveries</li>
          <li>• Save your details for faster checkout</li>
          <li>• Access invoices and order history</li>
        </ul>
      </div>
    </div>
  );
}

function Authed({ onLogout, onUpdate }:
  { onLogout:()=>Promise<void>; onUpdate:(i:{firstName?:string;lastName?:string;phone?:string})=>Promise<void> }) {
  const { user } = useAuth();
  const [first, setFirst] = useState(user?.firstName||'');
  const [last, setLast] = useState(user?.lastName||'');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);

  const save = async () => { setBusy(true); setMsg(null); try { await onUpdate({ firstName:first, lastName:last, phone }); setMsg('Profile updated'); } catch(err:any){ setMsg(err.message||'Update failed'); } finally{ setBusy(false);} };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="border rounded-xl p-6 lg:col-span-2">
        <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>Profile details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First name" value={first} onChange={setFirst} />
          <Input label="Last name" value={last} onChange={setLast} />
          <Input label="Phone" value={phone} onChange={setPhone} />
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={save} disabled={busy} className="bg-black text-white px-5 py-2 rounded-lg">{busy?'Saving...':'Save changes'}</button>
          <button onClick={()=>onLogout()} className="px-5 py-2 rounded-lg border">Sign out</button>
        </div>
        {msg && <p className="text-sm text-gray-600 mt-2">{msg}</p>}
      </div>
      <OrdersCard />
    </div>
  );
}

function OrdersCard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Array<{id:number; number:string; status:string; total:string; currency:string; dateCreated:string|null}>|null>(null);
  const [error, setError] = useState<string|null>(null);
  useEffect(()=>{ (async()=>{ try{ const res = await (await import('../services/wpAuth')).authApi.orders(); setItems(res.items);} catch(e:any){ setError(e.message||'Failed'); } })(); },[]);

  return (
    <div className="border rounded-xl p-6">
      <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>Recent orders</h3>
      {!items && !error && <p className="text-sm text-gray-500">Loading orders...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {items && items.length === 0 && <p className="text-sm text-gray-500">No orders yet.</p>}
      {items && items.length > 0 && (
        <ul className="divide-y">
          {items.map(o => (
            <li key={o.id} className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Order #{o.number}</p>
                <p className="text-gray-500">{new Date(o.dateCreated || '').toLocaleString()} • {o.status}</p>
              </div>
              <div className="text-right">{o.currency} {o.total}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type='text', required=false }:
  { label: string; value: string; onChange: (v:string)=>void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="text-gray-700">{label}</span>
      <input className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/70" value={value} onChange={(e)=>onChange(e.target.value)} type={type} required={required} />
    </label>
  );
}
