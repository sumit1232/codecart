import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { downloadProject, imgUrl, money } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  useEffect(() => { api.get('/orders/my').then((r) => setOrders(r.data)); }, []);

  return (
    <section className="section">
      <h1 className="page-title">Hi {user.name.split(' ')[0]}, here are your projects</h1>
      {orders === null ? <p className="muted">Loading…</p> : !orders.length ? (
        <p className="muted">You have not bought anything yet. <Link to="/projects">Browse projects</Link></p>
      ) : (
        <div className="list">
          {orders.map((o) => o.product && (
            <div className="row-card" key={o._id}>
              <img src={imgUrl(o.product.image)} alt="" />
              <div className="grow"><h3>{o.product.title}</h3>
                <small className="muted">Paid {money(o.amount)}{o.coupon ? ` with ${o.coupon}` : ''} on {new Date(o.createdAt).toLocaleDateString('en-IN')}</small></div>
              <Link className="btn ghost sm" to={`/projects/${o.product._id}#reviews`}>Review</Link>
              <button className="btn sm" onClick={() => downloadProject(o.product._id, o.product.file?.originalName).catch(() => toast.error('Download failed. Try again.'))}>Download</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
