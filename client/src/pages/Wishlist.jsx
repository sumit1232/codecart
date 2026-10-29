import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get('/users/wishlist').then((r) => setItems(r.data)); }, []);
  return (
    <section className="section">
      <h1 className="page-title">Your wishlist</h1>
      {items === null ? <p className="muted">Loading…</p> : !items.length
        ? <p className="muted">Nothing saved yet. Tap the heart on any project to keep it here. <Link to="/projects">Browse projects</Link></p>
        : <div className="grid">{items.map((p) => <ProductCard key={p._id} p={p} onUnsave={(id) => setItems((l) => l.filter((x) => x._id !== id))} />)}</div>}
    </section>
  );
}
