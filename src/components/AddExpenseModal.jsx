import { useState, useEffect } from 'react';

export default function AddExpenseModal({ category, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [showOverWarning, setShowOverWarning] = useState(false);

  const remaining = category.limit - category.spent;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (val > remaining && !showOverWarning) {
      setShowOverWarning(true);
      return;
    }
    onSave(val, note.trim(), new Date(date).toISOString());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
      >
        <div className="flex items-center gap-2 mb-5">
          {category.emoji && <span className="text-xl">{category.emoji}</span>}
          <h2 className="text-lg font-semibold text-white">Add Expense</h2>
          <span className="text-sm ml-auto" style={{ color: '#666' }}>{category.name}</span>
        </div>

        <div className="rounded-lg px-4 py-3 mb-4 flex justify-between text-sm" style={{ backgroundColor: '#111', border: '1px solid #2a2a2a' }}>
          <span style={{ color: '#888' }}>Remaining budget</span>
          <span style={{ color: remaining <= 0 ? '#ef4444' : '#fff' }}>
            ${Math.max(0, remaining).toFixed(2)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#888' }}>Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setShowOverWarning(false); setError(''); }}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              autoFocus
              className="rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-white/20"
              style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#888' }}>Note (optional)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What was this for?"
              className="rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-white/20"
              style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff' }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#888' }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-white/20"
              style={{ backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff', colorScheme: 'dark' }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

          {showOverWarning && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              This expense of <strong>${parseFloat(amount).toFixed(2)}</strong> exceeds your remaining budget of <strong>${Math.max(0, remaining).toFixed(2)}</strong>. Submit again to proceed anyway.
            </div>
          )}

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
              {showOverWarning ? 'Confirm Anyway' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
