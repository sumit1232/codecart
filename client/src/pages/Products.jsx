import { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export const CATEGORIES = ['All', 'Web App', 'Mobile App', 'AI / ML', 'E-commerce', 'Game', 'Other'];

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api.get('/products', { params: { q, category, sort } }).then((r) => setItems(r.data)).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q, category, sort]);

  return (
    <section className="section">
      <h1 className="page-title">All projects</h1>
      <div className="filters">
        <div className="row nowrap">
          <input placeholder="Search by title or tech, e.g. React, Razorpay" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search projects" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort projects" className="sort">
            <option value="newest">Newest</option><option value="popular">Most sold</option><option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
          </select>
        </div>
        <div className="pills scroll">{CATEGORIES.map((c) => <button key={c} className={c === category ? 'pill on' : 'pill'} onClick={() => setCategory(c)}>{c}</button>)}</div>
      </div>
      {loading ? <p className="muted">Loading projects…</p>
        : items.length ? <div className="grid">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        : <p className="muted">No projects match that search. Try another keyword or category.</p>}
    </section>
  );
}
