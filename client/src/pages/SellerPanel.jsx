import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg, imgUrl, money } from '../api';
import { CATEGORIES } from './Products';

const empty = { title: '', description: '', price: '', category: 'Web App', techStack: '', demoUrl: '' };

export default function SellerPanel() {
  const [f, setF] = useState(empty);
  const [cover, setCover] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [zip, setZip] = useState(null);
  const [progress, setProgress] = useState(0);
  const [mine, setMine] = useState([]);
  const [stats, setStats] = useState(null);
  const coverPrev = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover]);
  const galPrev = useMemo(() => gallery.map((g) => URL.createObjectURL(g)), [gallery]);

  const load = () => Promise.all([api.get('/products/mine/list'), api.get('/products/mine/stats')]).then(([l, s]) => { setMine(l.data); setStats(s.data); });
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pickGallery = (e) => {
    const files = [...e.target.files];
    if (files.length > 4) toast('Only the first 4 screenshots are used');
    setGallery(files.slice(0, 4));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!cover || !zip) return toast.error('Add a cover image and the project .zip');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    fd.append('image', cover); gallery.forEach((g) => fd.append('gallery', g)); fd.append('file', zip);
    const form = e.target;
    try {
      await api.post('/products', fd, { onUploadProgress: (p) => setProgress(Math.round((p.loaded / (p.total || 1)) * 100)) });
      toast.success('Submitted. It goes live after admin review.');
      setF(empty); setCover(null); setGallery([]); setZip(null); form.reset(); load();
    } catch (err) { toast.error(errMsg(err)); }
    setProgress(0);
  };

  const remove = async (id) => {
    if (!confirm('Remove this project?')) return;
    try { const { data } = await api.delete(`/products/${id}`); toast.success(data.message); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <section className="section">
      <h1 className="page-title">Seller studio</h1>
      {stats && <div className="stats">
        <div><b>{stats.listings}</b><span>Listings</span></div>
        <div><b>{stats.sales}</b><span>Sales</span></div>
        <div><b>{money(stats.gross)}</b><span>Gross sales</span></div>
        <div><b>{money(stats.net)}</b><span>Your earnings after {stats.fee}% fee</span></div>
      </div>}

      <div className="two-col">
        <form className="panel" onSubmit={submit}>
          <h2>List a new project</h2>
          <input placeholder="Project title" value={f.title} onChange={set('title')} required />
          <textarea rows={5} placeholder="What does it do, what is included, how to run it?" value={f.description} onChange={set('description')} required />
          <div className="row nowrap">
            <input type="number" min="1" placeholder="Price in ₹" value={f.price} onChange={set('price')} required />
            <select value={f.category} onChange={set('category')} aria-label="Category">{CATEGORIES.slice(1).map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <input placeholder="Tech stack, comma separated (React, Node, MongoDB)" value={f.techStack} onChange={set('techStack')} />
          <input type="url" placeholder="Live demo link (optional)" value={f.demoUrl} onChange={set('demoUrl')} />

          <label className="file">Cover image (JPG, PNG, WebP)
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setCover(e.target.files[0])} />
            {coverPrev && <img className="preview" src={coverPrev} alt="Cover preview" />}
          </label>
          <label className="file">Screenshots (up to 4)
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={pickGallery} />
            {!!galPrev.length && <div className="preview-row">{galPrev.map((s) => <img key={s} className="preview" src={s} alt="Screenshot preview" />)}</div>}
          </label>
          <label className="file">Project files (.zip, up to 100 MB)
            <input type="file" accept=".zip" onChange={(e) => setZip(e.target.files[0])} />
          </label>
          {progress > 0 && <div className="bar"><i style={{ width: `${progress}%` }} /></div>}
          <button className="btn wide" disabled={progress > 0}>{progress > 0 ? `Uploading ${progress}%` : 'Submit for review'}</button>
        </form>

        <div>
          <h2>Your listings</h2>
          {!mine.length && <p className="muted">Nothing listed yet. Your first project will appear here.</p>}
          <div className="list">
            {mine.map((p) => (
              <div className="row-card" key={p._id}>
                <img src={imgUrl(p.image)} alt="" />
                <div className="grow"><h3>{p.title}</h3><small className="muted">{money(p.price)} · {p.sales} sold</small></div>
                <span className={`status ${p.status}`}>{p.status}</span>
                {p.status !== 'archived' && <button className="btn ghost sm" onClick={() => remove(p._id)}>Remove</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
