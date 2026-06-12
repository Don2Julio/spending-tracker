export default function Dashboard({ categories }) {
  const totalBudget = categories.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const fullCount = categories.filter(c => c.spent >= c.limit).length;
  const activeCount = categories.length - fullCount;
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  if (categories.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{ backgroundColor: '#111', border: '1px solid #1f1f1f' }}
    >
      <h2 className="text-sm font-medium mb-4" style={{ color: '#666' }}>Overview</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
        <Stat label="Total Budget" value={`$${totalBudget.toFixed(2)}`} />
        <Stat label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
        <Stat label="Categories Full" value={fullCount} highlight={fullCount > 0} />
        <Stat label="Active" value={activeCount} />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs" style={{ color: '#555' }}>Overall spending</span>
          <span className="text-xs" style={{ color: '#555' }}>{overallPct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#2a2a2a' }}>
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${overallPct}%`,
              backgroundColor: overallPct >= 100 ? '#ef4444' : overallPct >= 75 ? '#f59e0b' : '#e5e5e5',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: '#555' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: highlight ? '#ef4444' : '#fff' }}>{value}</p>
    </div>
  );
}
