import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    const fd = new FormData(); fd.append('name', name); if (file) fd.append('avatar', file);
    try { const { data } = await api.put('/users/profile', fd); setUser((u) => ({ ...u, ...data.user })); setFile(null); toast.success('Profile updated'); }
    catch (err) { toast.error(errMsg(err)); }
    setBusy(false);
  };

  return (
    <section className="auth">
      <form className="panel" onSubmit={save}>
        <h1>Your profile</h1>
        <div className="avatar-row">
          {preview ? <img className="avatar" style={{ width: 84, height: 84 }} src={preview} alt="New avatar preview" /> : <Avatar user={user} size={84} />}
          <label className="btn ghost sm">Change photo
            <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => setFile(e.target.files[0])} />
          </label>
        </div>
        <small className="muted">JPG, PNG or WebP, up to 2 MB.</small>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
        <input value={user.email} disabled aria-label="Email" />
        <span className="chip">Role: {user.role}</span>
        <button className="btn wide" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </section>
  );
}
