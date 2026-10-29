import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg, imgUrl, money } from '../api';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [tab, setTab] = useState('products');
  const [cf, setCf] = useState({ code: '', percent: 10, maxUses: 0, expiresAt: '' });

  const load = () => Promise.all([api.get('/admin/stats'), api.get('/admin/products'), api.get('/admin/users'), api.get('/admin/coupons')])
    .then(([s, p, u, c]) => { setStats(s.data); setProducts(p.data); setUsers(u.data); setCoupons(c.data); });
  useEffect(() => { load(); }, []);

  const act = (fn, ok) => async (...a) => { try { await fn(...a); if (ok) toast.success(ok); load(); return true; } catch (e) { toast.error(errMsg(e)); return false; } };
  const setStatus = act((id, status) => api.patch(`/admin/products/${id}/status`, { status }), 'Updated');
  const setRole = act((id, role) => api.patch(`/admin/users/${id}/role`, { role }), 'Role updated');
  const toggle = act((id) => api.patch(`/admin/coupons/${id}/toggle`));
  const delCoupon = act((id) => api.delete(`/admin/coupons/${id}`), 'Coupon deleted');
  const delProduct = act((id) => api.delete(`/products/${id}`), 'Done');
  const addCoupon = (e) => { e.preventDefault(); act(() => api.post('/admin/coupons', cf), 'Coupon created')().then((ok) => ok && setCf({ code: '', percent: 10, maxUses: 0, expiresAt: '' })); };

  const tabs = [['products', 'Projects'], ['users', 'Users'], ['coupons', 'Coupons']];
  return (
    <section className="section">
      <h1 className="page-title">Admin</h1>
      {stats && <div className="stats">
        <div><b>{money(stats.revenue)}</b><span>Revenue</span></div>
        <div><b>{money(stats.commission)}</b><span>Platform commission</span></div>
        <div><b>{stats.orders}</b><span>Orders</span></div>
        <div><b>{stats.pending}</b><span>Awaiting review</span></div>
      </div>}
      <div className="pills">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'pill on' : 'pill'} onClick={() => setTab(k)}>{l}</button>)}</div>

      {tab === 'products' && <div className="list">
        {products.map((p) => (
          <div className="row-card" key={p._id}>
            <img src={imgUrl(p.image)} alt="" />
            <div className="grow"><h3>{p.title}</h3><small className="muted">{money(p.price)} · {p.seller?.name} ({p.seller?.email})</small></div>
            <span className={`status ${p.status}`}>{p.status}</span>
            {!['approved', 'archived'].includes(p.status) && <button className="btn sm" onClick={() => setStatus(p._id, 'approved')}>Approve</button>}
            {!['rejected', 'archived'].includes(p.status) && <button className="btn ghost sm" onClick={() => setStatus(p._id, 'rejected')}>Reject</button>}
            <button className="btn ghost sm" onClick={() => confirm('Remove this project?') && delProduct(p._id)}>Remove</button>
          </div>))}
        {!products.length && <p className="muted">No projects submitted yet.</p>}
      </div>}

      {tab === 'users' && <div className="list">
        {users.map((u) => (
          <div className="row-card" key={u._id}>
            <div className="grow"><h3>{u.name}</h3><small className="muted">{u.email}{u.googleId ? ' · Google' : ''}{u.isVerified ? '' : ' · not verified'}</small></div>
            <select value={u.role} onChange={(e) => setRole(u._id, e.target.value)} aria-label={`Role for ${u.name}`}>
              <option value="student">student</option><option value="seller">seller</option><option value="admin">admin</option>
            </select>
          </div>))}
      </div>}

      {tab === 'coupons' && <div className="two-col">
        <form className="panel" onSubmit={addCoupon}>
          <h2>New coupon</h2>
          <input placeholder="Code, e.g. WELCOME10" value={cf.code} onChange={(e) => setCf({ ...cf, code: e.target.value.toUpperCase() })} required />
          <div className="row nowrap">
            <label className="file">Discount %<input type="number" min="1" max="90" value={cf.percent} onChange={(e) => setCf({ ...cf, percent: e.target.value })} required /></label>
            <label className="file">Max uses (0 = unlimited)<input type="number" min="0" value={cf.maxUses} onChange={(e) => setCf({ ...cf, maxUses: e.target.value })} /></label>
          </div>
          <label className="file">Expires on (optional)<input type="date" value={cf.expiresAt} onChange={(e) => setCf({ ...cf, expiresAt: e.target.value })} /></label>
          <button className="btn wide">Create coupon</button>
        </form>
        <div className="list">
          {coupons.map((c) => (
            <div className="row-card" key={c._id}>
              <div className="grow"><h3>{c.code}</h3><small className="muted">{c.percent}% off · used {c.used}{c.maxUses ? `/${c.maxUses}` : ''}{c.expiresAt ? ` · ends ${new Date(c.expiresAt).toLocaleDateString('en-IN')}` : ''}</small></div>
              <span className={`status ${c.active ? 'approved' : 'rejected'}`}>{c.active ? 'active' : 'off'}</span>
              <button className="btn ghost sm" onClick={() => toggle(c._id)}>{c.active ? 'Turn off' : 'Turn on'}</button>
              <button className="btn ghost sm" onClick={() => delCoupon(c._id)}>Delete</button>
            </div>))}
          {!coupons.length && <p className="muted">No coupons yet. Create one to run a discount.</p>}
        </div>
      </div>}
    </section>
  );
}
