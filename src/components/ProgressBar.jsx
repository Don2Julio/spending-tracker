export default function ProgressBar({ spent, limit }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isFull = spent >= limit;
  const isWarning = !isFull && pct >= 75;

  let barColor = '#e5e5e5';
  if (isFull) barColor = '#ef4444';
  else if (isWarning) barColor = '#f59e0b';

  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
      <div
        className="progress-bar-fill h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: barColor }}
      />
    </div>
  );
}
