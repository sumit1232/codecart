import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// Google (Passport) redirects here with #token=...&next=...
export default function AuthCallback() {
  const { login } = useAuth();
  const nav = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; ran.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token'), next = params.get('next') === 'seller' ? '/seller' : '/dashboard';
    window.history.replaceState(null, '', window.location.pathname); // remove token from the address bar
    if (!token) return nav('/auth', { replace: true });
    localStorage.setItem('token', token);
    api.get('/auth/me')
      .then((r) => { login(token, r.data.user); toast.success(`Welcome, ${r.data.user.name.split(' ')[0]}`); nav(next, { replace: true }); })
      .catch(() => { localStorage.removeItem('token'); toast.error('Google sign-in failed. Try again.'); nav('/auth', { replace: true }); });
  }, []);

  return <div className="center-msg">Signing you in…</div>;
}
