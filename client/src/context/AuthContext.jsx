import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/auth/me').then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const login = (token, u) => { localStorage.setItem('token', token); setUser(u); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  const toggleWish = async (id) => {
    const { data } = await api.post(`/users/wishlist/${id}`);
    setUser((u) => ({ ...u, wishlist: data.wishlist }));
    return data.added;
  };

  return <Ctx.Provider value={{ user, setUser, loading, login, logout, toggleWish }}>{children}</Ctx.Provider>;
}
