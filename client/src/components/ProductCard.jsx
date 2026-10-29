import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { errMsg, imgUrl, money } from '../api';
import { useAuth } from '../context/AuthContext';
import Stars from './Stars';

// 3D tilt on hover (mouse devices only), wishlist heart, rating
export default function ProductCard({ p, onUnsave }) {
  const ref = useRef();
  const { user, toggleWish } = useAuth();
  const nav = useNavigate();
  const liked = user?.wishlist?.includes(p._id);

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(6px)`;
  };
  const heart = async () => {
    if (!user) { toast('Log in to save projects'); return nav('/auth'); }
    try { const added = await toggleWish(p._id); toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist'); if (!added) onUnsave?.(p._id); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <article className="card" ref={ref} onMouseMove={move} onMouseLeave={() => (ref.current.style.transform = '')}>
      <Link to={`/projects/${p._id}`} className="card-img">
        <img src={imgUrl(p.image)} alt={p.title} loading="lazy" />
        <span className="tag">{p.category}</span>
      </Link>
      <button className={`heart ${liked ? 'on' : ''}`} onClick={heart} aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={!!liked}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
      </button>
      <div className="card-body">
        <Link to={`/projects/${p._id}`}><h3>{p.title}</h3></Link>
        <div className="stack">{p.techStack.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</div>
        <div className="card-meta">
          {p.numReviews ? <><Stars value={p.rating} /><small>{p.rating} ({p.numReviews})</small></> : <small>New</small>}
          <small className="right">{p.sales} sold</small>
        </div>
        <div className="card-foot"><strong className="price">{money(p.price)}</strong><small>by {p.seller?.name}</small></div>
      </div>
    </article>
  );
}
