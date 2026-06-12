import { useState, useEffect } from 'react';

const RESET_PERIODS = ['Weekly', 'Monthly', 'Annually'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR + i);

function buildLastReset({ resetPeriod, weeklyDay, monthlyMonth, annualYear }) {
  const now = new Date();
  if (resetPeriod === 'Weekly') {
    if (weeklyDay) return new Date(weeklyDay).toISOString();
    // default: today
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d.toISOString();
  }
  if (resetPeriod === 'Monthly') {
    const month = monthlyMonth ?? now.getMonth();
    return new Date(now.getFullYear(), month, 1).toISOString();
  }
  if (resetPeriod === 'Annually') {
    const year = annualYear ?? now.getFullYear();
    return new Date(year, 0, 1).toISOString();
  }
  return now.toISOString();
}

// ── Weekly mini-calendar ──────────────────────────────────────────────────────
function WeeklyCalendar({ selected, onChange }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedDay = selected ? new Date(selected).getDate() : null;

  return (
    <div>
      <p className="text-xs mb-2" style={{ color: '#888' }}>
        {MONTH_FULL[month]} {year} — pick a start day (resets 7 days later)
      </p>
      <div className="grid grid-cols-7 gap-px text-center mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-xs py-1" style={{ color: '#555' }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isSelected = day === selectedDay;
          const isToday = day === today.getDate();
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(new Date(year, month, day).toISOString())}
              className="rounded-md py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: isSelected ? '#fff' : 'transparent',
                color: isSelected ? '#000' : isToday ? '#aaa' : '#666',
                border: isToday && !isSelected ? '1px solid #333' : '1px solid transparent',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Monthly picker ────────────────────────────────────────────────────────────
function MonthlyPicker({ selected, onChange }) {
  return (
    <div>
      <p className="text-xs mb-2" style={{ color: '#888' }}>
        Pick a month — budget resets on the 1st of each following month
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MONTHS.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: selected === i ? '#fff' : '#111',
              color: selected === i ? '#000' : '#666',
              border: `1px solid ${selected === i ? '#fff' : '#2a2a2a'}`,
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Annual picker ─────────────────────────────────────────────────────────────
function AnnualPicker({ selected, onChange }) {
  return (
    <div>
      <p className="text-xs mb-2" style={{ color: '#888' }}>
        Pick a year — budget resets on Jan 1 of each following year
      </p>
      <div className="grid grid-cols-4 gap-2">
        {YEARS.map(y => (
          <button
            key={y}
            type="button"
            onClick={() => onChange(y)}
            className="py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: selected === y ? '#fff' : '#111',
              color: selected === y ? '#000' : '#666',
              border: `1px solid ${selected === y ? '#fff' : '#2a2a2a'}`,
            }}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AddCategoryModal({ onClose, onSave, initial }) {
  const now = new Date();

  const [name, setName] = useState(initial?.name || '');
  const [emoji, setEmoji] = useState(initial?.emoji || '');
  const [limit, setLimit] = useState(initial?.limit || '');
  const [resetPeriod, setResetPeriod] = useState(initial?.resetPeriod || 'Monthly');
  const [error, setError] = useState('');

  // Date sub-selections
  const [weeklyDay, setWeeklyDay] = useState(
    initial?.resetPeriod === 'Weekly' ? initial.lastReset : null
  );
  const [monthlyMonth, setMonthlyMonth] = useState(
    initial?.resetPeriod === 'Monthly'
      ? new Date(initial.lastReset).getMonth()
      : now.getMonth()
  );
  const [annualYear, setAnnualYear] = useState(
    initial?.resetPeriod === 'Annually'
      ? new Date(initial.lastReset).getFullYear()
      : now.getFullYear()
  );

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handlePeriodChange(p) {
    setResetPeriod(p);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!limit || isNaN(parseFloat(limit)) || parseFloat(limit) <= 0) {
      setError('Enter a valid limit amount');
      return;
    }
    const lastReset = buildLastReset({ resetPeriod, weeklyDay, monthlyMonth, annualYear });
    onSave({ name: name.trim(), emoji: emoji.trim(), limit, resetPeriod, lastReset });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        <h2 className="text-lg font-semibold text-white mb-5">
          {initial ? 'Edit Category' : 'New Category'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name + emoji */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 w-16">
              <label className="text-xs" style={{ color: '#888' }}>Emoji</label>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                maxLength={2}
                placeholder="🛒"
                className="rounded-lg px-3 py-2 text-center text-lg outline-none focus:ring-1 focus:ring-white/20"
                style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff' }}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs" style={{ color: '#888' }}>Category Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Groceries"
                autoFocus
                className="rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-white/20"
                style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff' }}
              />
            </div>
          </div>

          {/* Limit */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#888' }}>Spending Limit ($)</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className="rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-white/20"
              style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff' }}
            />
          </div>

          {/* Reset period tabs */}
          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: '#888' }}>Reset Period</label>
            <div className="flex gap-2">
              {RESET_PERIODS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodChange(p)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: resetPeriod === p ? '#333' : '#111',
                    border: `1px solid ${resetPeriod === p ? '#555' : '#2a2a2a'}`,
                    color: resetPeriod === p ? '#fff' : '#888',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-selector */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#111', border: '1px solid #222' }}
          >
            {resetPeriod === 'Weekly' && (
              <WeeklyCalendar selected={weeklyDay} onChange={setWeeklyDay} />
            )}
            {resetPeriod === 'Monthly' && (
              <MonthlyPicker selected={monthlyMonth} onChange={setMonthlyMonth} />
            )}
            {resetPeriod === 'Annually' && (
              <AnnualPicker selected={annualYear} onChange={setAnnualYear} />
            )}
          </div>

          {/* Summary line */}
          <p className="text-xs" style={{ color: '#555' }}>
            {resetPeriod === 'Weekly' && weeklyDay && (
              <>Starts {new Date(weeklyDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, resets every 7 days</>
            )}
            {resetPeriod === 'Weekly' && !weeklyDay && <>Select a start day above</>}
            {resetPeriod === 'Monthly' && (
              <>Resets on the 1st of each month, starting after {MONTH_FULL[monthlyMonth]}</>
            )}
            {resetPeriod === 'Annually' && (
              <>Resets on Jan 1, {annualYear + 1} and each year after</>
            )}
          </p>

          {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#888' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
            >
              {initial ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
