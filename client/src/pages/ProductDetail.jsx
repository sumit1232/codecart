import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { downloadProject, errMsg, imgUrl, money } from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import Stars from '../components/Stars';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true); s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export default function ProductDetail() {
  const { id } = useParams();
  const { user, toggleWish } = useAuth();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [active, setActive] = useState(0);
  const [owned, setOwned] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [code, setCode] = useState('');
  const [deal, setDeal] = useState(null); // { percent, final }
  const [busy, setBusy] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [comment, setComment] = useState('');
  const imgRef = useRef();

  const loadReviews = () => api.get(`/products/${id}/reviews`).then((r) => setReviews(r.data));
  const loadProduct = () => api.get(`/products/${id}`).then((r) => setP(r.data)).catch(() => nav('/projects'));
  useEffect(() => { loadProduct(); loadReviews(); setActive(0); setDeal(null); }, [id]);
  useEffect(() => { if (user) api.get('/orders/my').then((r) => setOwned(r.data.some((o) => o.product?._id === id))); }, [user, id]);

  const tilt = (e) => {
    const r = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    imgRef.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  };

  const applyCode = async () => {
    if (!user) return nav('/auth', { state: { from: `/projects/${id}` } });
    try { const { data } = await api.post('/orders/coupon-check', { productId: id, code }); setDeal(data); toast.success(`${data.percent}% off applied`); }
    catch (e) { setDeal(null); toast.error(errMsg(e)); }
  };

  const buy = async () => {
    if (!user) return nav('/auth', { state: { from: `/projects/${id}` } });
    setBusy(true);
    try {
      if (!(await loadRazorpay())) throw new Error('Could not load the payment window. Check your connection.');
      const { data } = await api.post('/orders/create', { productId: id, coupon: deal ? code : undefined });
      const rzp = new window.Razorpay({
        key: data.key, amount: data.order.amount, currency: data.order.currency, order_id: data.order.id,
        name: 'CodeCart', description: data.product.title, theme: { color: '#7c5cff' },
        prefill: { name: user.name, email: user.email },
        handler: async (resp) => {
          try { await api.post('/orders/verify', resp); toast.success('Payment received. Your download is ready.'); setOwned(true); loadProduct(); }
          catch (e) { toast.error(errMsg(e)); }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on('payment.failed', (r) => toast.error(r.error.description));
      rzp.open();
    } catch (e) { toast.error(e.response ? errMsg(e) : e.message); }
    setBusy(false);
  };

  const sendReview = async (e) => {
    e.preventDefault();
    try { await api.post(`/products/${id}/reviews`, { rating: myRating, comment }); toast.success('Review saved'); setComment(''); loadReviews(); loadProduct(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  if (!p) return <div className="center-msg">Loading…</div>;
  const images = [p.image, ...(p.gallery || [])];
  const liked = user?.wishlist?.includes(p._id);

  return (
    <section className="section">
      <div className="detail">
        <div>
          <div className="stage" onMouseMove={tilt} onMouseLeave={() => (imgRef.current.style.transform = '')}>
            <img ref={imgRef} className="detail-img" src={imgUrl(images[active])} alt={p.title} />
          </div>
          {images.length > 1 && <div className="thumbs">{images.map((im, i) =>
            <button key={im} className={i === active ? 'on' : ''} onClick={() => setActive(i)} aria-label={`Screenshot ${i + 1}`}><img src={imgUrl(im)} alt="" /></button>)}</div>}
        </div>

        <div>
          <span className="tag static">{p.category}</span>
          <h1>{p.title}</h1>
          <div className="rate-line">
            <Stars value={p.rating} /><span className="muted">{p.numReviews ? `${p.rating} from ${p.numReviews} ${p.numReviews === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</span>
          </div>
          <p className="muted">By {p.seller?.name} · {p.sales} sold</p>
          <div className="stack big">{p.techStack.map((t) => <span key={t}>{t}</span>)}</div>
          <p className="desc">{p.description}</p>
          <p className="muted">Includes {p.file?.originalName} ({(p.file?.size / 1048576).toFixed(1)} MB)</p>
          {p.demoUrl && <a className="link" href={p.demoUrl} target="_blank" rel="noopener noreferrer">Open live demo</a>}

          <div className="buy">
            <div className="price-box">
              {deal && <s className="muted">{money(p.price)}</s>}
              <strong className="price xl">{money(deal ? deal.final : p.price)}</strong>
            </div>
            {owned
              ? <button className="btn" onClick={() => downloadProject(p._id, p.file?.originalName).catch(() => toast.error('Download failed. Try again.'))}>Download project</button>
              : <button className="btn" onClick={buy} disabled={busy}>{busy ? 'Opening payment…' : 'Buy now'}</button>}
            <button className={`btn ghost ${liked ? 'on' : ''}`} onClick={async () => {
              if (!user) return nav('/auth', { state: { from: `/projects/${id}` } });
              toast.success((await toggleWish(p._id)) ? 'Saved to wishlist' : 'Removed from wishlist');
            }}>{liked ? 'Saved' : 'Save'}</button>
          </div>
          {!owned && (
            <div className="coupon">
              <input placeholder="Coupon code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setDeal(null); }} aria-label="Coupon code" />
              <button className="btn ghost sm" onClick={applyCode} disabled={!code}>Apply</button>
            </div>
          )}
        </div>
      </div>

      <div className="reviews" id="reviews">
        <h2>Reviews</h2>
        {owned && (
          <form className="panel review-form" onSubmit={sendReview}>
            <strong>Rate this project</strong>
            <Stars value={myRating} onChange={setMyRating} />
            <textarea rows={3} placeholder="What worked well? Was the setup guide clear?" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
            <button className="btn sm">Post review</button>
          </form>
        )}
        {!reviews.length && <p className="muted">No reviews yet. Buyers can leave the first one.</p>}
        {reviews.map((r) => (
          <div className="review" key={r._id}>
            <Avatar user={r.user} size={38} />
            <div><div className="rate-line"><strong>{r.user?.name}</strong><Stars value={r.rating} /></div>
              {r.comment && <p>{r.comment}</p>}<small className="muted">{new Date(r.createdAt).toLocaleDateString('en-IN')}</small></div>
          </div>
        ))}
      </div>
    </section>
  );
}
