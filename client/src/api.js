import axios from 'axios';

export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const imgUrl = (n) => `${API}/uploads/images/${n}`;
export const avatarUrl = (a) => (!a ? null : a.startsWith('http') ? a : `${API}/uploads/avatars/${a}`);

const api = axios.create({ baseURL: `${API}/api` });
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const errMsg = (e) => e.response?.data?.message || 'Something went wrong. Try again.';
export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Authenticated download: fetch the zip as a blob with the JWT, then save it
export async function downloadProject(id, name) {
  const { data } = await api.get(`/orders/download/${id}`, { responseType: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(data); a.download = name || 'project.zip'; a.click();
  URL.revokeObjectURL(a.href);
}
export default api;
