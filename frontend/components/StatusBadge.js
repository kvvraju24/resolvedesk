import { label } from './api';

export default function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{label(status)}</span>;
}
