import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { API, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Orb3D = lazy(() => import('../components/Orb3D'));
const GoogleG = () => <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.5 5.8c4.4-4.1 7-10.1 7-17.5z" /><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>;

export default function Auth() {
  const [mode, setMode] = useState('login');       // login | register | otp
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'student', otp: '' });
  const [busy, setBusy] = useState(false);
  const { login, user } = useAuth();
  const { theme } = useTheme();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const from = useLocation().state?.from || '/dashboard';
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { if (user) nav(from, { replace: true }); }, [user]);
  useEffect(() => {
    if (sp.get('error')) toast.error(sp.get('error') === 'google_off' ? 'Google sign-in is not set up on this server yet' : 'Google sign-in failed. Try again.');
  }, []);

  const run = async (fn) => { setBusy(true); try { await fn(); } catch (e) { toast.error(errMsg(e)); } setBusy(false); };

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      if (mode === 'register') { await api.post('/auth/register', f); toast.success('We emailed you a 6-digit code'); setMode('otp'); }
      else if (mode === 'login') {
        try { const { data } = await api.post('/auth/login', f); login(data.token, data.user); nav(from); }
        catch (e) { if (e.response?.data?.needsVerification) { toast(e.response.data.message); setMode('otp'); } else throw e; }
      } else {
        const { data } = await api.post('/auth/verify-otp', { email: f.email, otp: f.otp });
        login(data.token, data.user); toast.success('Email verified. Welcome!'); nav(from);
      }
    });
  };
  const resend = () => run(async () => { await api.post('/auth/resend-otp', { email: f.email }); toast.success('New code sent'); });

  return (
    <section className="auth">
      <div className="auth-orb" aria-hidden="true"><Suspense fallback={null}><Orb3D dark={theme === 'dark'} /></Suspense></div>
      <form className="panel" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Check your email'}</h1>
        {mode === 'otp' && <p className="muted">Enter the 6-digit code we sent to {f.email}. It expires in 10 minutes.</p>}

        {mode === 'register' && (
          <div className="seg" role="radiogroup" aria-label="Account type">
            {[['student', 'I want to buy'], ['seller', 'I want to sell']].map(([v, l]) =>
              <button type="button" key={v} className={f.role === v ? 'on' : ''} onClick={() => setF({ ...f, role: v })}>{l}</button>)}
          </div>
        )}

        {mode !== 'otp' && (
          <>
            <a className="btn google wide" href={`${API}/api/auth/google?role=${f.role}`}><GoogleG /> Continue with Google</a>
            <div className="or"><span>or use email</span></div>
          </>
        )}

        {mode === 'register' && <input placeholder="Full name" value={f.name} onChange={set('name')} autoComplete="name" required />}
        {mode !== 'otp' && <>
          <input type="email" placeholder="Email" value={f.email} onChange={set('email')} autoComplete="email" required />
          <input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
        </>}
        {mode === 'otp' && <input className="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="------" value={f.otp} onChange={(e) => setF({ ...f, otp: e.target.value.replace(/\D/g, '') })} required />}

        <button className="btn wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'register' ? 'Send verification code' : 'Verify and continue'}</button>
        {mode === 'otp' && <button type="button" className="link" onClick={resend}>Send a new code</button>}
        {mode !== 'otp' && <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'New here? Create an account' : 'Already registered? Log in'}</button>}
      </form>
    </section>
  );
}
