export default function Stars({ value = 0, onChange }) {
  return (
    <span className="stars" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => onChange
        ? <button type="button" key={i} className={i <= value ? 'on' : ''} onClick={() => onChange(i)} aria-label={`${i} stars`}>★</button>
        : <span key={i} className={i <= Math.round(value) ? 'on' : ''}>★</span>)}
    </span>
  );
}
