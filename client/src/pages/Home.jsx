import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';

const Hero3D = lazy(() => import('../components/Hero3D'));

export default function Home() {
  const [items, setItems] = useState([]);
  const { theme } = useTheme();
  useEffect(() => { api.get('/products', { params: { sort: 'popular' } }).then((r) => setItems(r.data.slice(0, 6))).catch(() => {}); }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Ship your final-year project with real, working code.</h1>
          <p>Buy complete MERN, React and Node projects with source, setup guide and database. Download the zip the moment your payment clears.</p>
          <div className="row">
            <Link to="/projects" className="btn">Browse projects</Link>
            <Link to="/auth" className="btn ghost">Sell your own</Link>
          </div>
          <ul className="perks">
            <li>Pay with UPI, cards or net banking</li>
            <li>Instant download after payment</li>
            <li>Every listing is reviewed before it goes live</li>
          </ul>
        </div>
        <div className="hero-3d" aria-hidden="true"><Suspense fallback={null}><Hero3D dark={theme === 'dark'} /></Suspense></div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Popular right now</h2><Link to="/projects">See all projects</Link></div>
        {items.length ? <div className="grid">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
          : <p className="muted">No projects yet. Sellers can list the first one from their account.</p>}
      </section>
    </>
  );
}
