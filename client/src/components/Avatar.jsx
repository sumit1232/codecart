import { avatarUrl } from '../api';
export default function Avatar({ user, size = 34 }) {
  const src = avatarUrl(user?.avatar);
  return src
    ? <img className="avatar" style={{ width: size, height: size }} src={src} alt="" referrerPolicy="no-referrer" />
    : <span className="avatar ph" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(user?.name || '?')[0].toUpperCase()}</span>;
}
