import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

const Sun = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const Moon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="nav">
      <Link to="/" className="logo"><span className="logo-mark" />CodeCart</Link>
      <div className={`menu ${open ? 'open' : ''}`}>
        <nav>
          <NavLink to="/projects">Browse</NavLink>
          {user && <NavLink to="/dashboard">My purchases</NavLink>}
          {user && <NavLink to="/wishlist">Wishlist</NavLink>}
          {user && ['seller', 'admin'].includes(user.role) && <NavLink to="/seller">Sell</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="menu-end">
          {user ? (
            <>
              <Link to="/profile" className="me"><Avatar user={user} size={32} /><span>{user.name.split(' ')[0]}</span><em>{user.role}</em></Link>
              <button className="btn ghost sm" onClick={() => { logout(); nav('/'); }}>Log out</button>
            </>
          ) : <Link to="/auth" className="btn sm">Log in</Link>}
        </div>
      </div>
      <div className="nav-actions">
        <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
        <button className={`burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><i /><i /><i /></button>
      </div>
    </header>
  );
}
