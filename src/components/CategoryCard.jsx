import { useState } from 'react';
import ProgressBar from './ProgressBar';
import AddExpenseModal from './AddExpenseModal';
import AddCategoryModal from './AddCategoryModal';

export default function CategoryCard({ category, onAddExpense, onEdit, onDelete, onReset, timeUntilReset }) {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { spent, limit, name, emoji } = category;
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isFull = spent >= limit;
  const isWarning = !isFull && pct >= 75;

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    border: isFull ? '1px solid rgba(239,68,68,0.5)' : '1px solid #2a2a2a',
    boxShadow: isFull ? '0 0 12px rgba(239,68,68,0.5)' : 'none',
    borderRadius: '1rem',
    padding: '1.25rem',
    position: 'relative',
  };

  return (
    <>
      <div style={cardStyle}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {emoji && <span className="text-2xl leading-none">{emoji}</span>}
            <div>
              <h3 className="font-semibold text-white text-sm">{name}</h3>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>{timeUntilReset}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isFull && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                Budget Full
              </span>
            )}
            {isWarning && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                Near Limit
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="p-1 rounded-md transition-colors"
                style={{ color: '#666' }}
                onBlur={() => setTimeout(() => setShowMenu(false), 150)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
                </svg>
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-7 rounded-lg py-1 z-10 min-w-32"
                  style={{ backgroundColor: '#222', border: '1px solid #333' }}
                >
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#ccc' }}
                    onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#ccc' }}
                    onClick={() => { onReset(category.id); setShowMenu(false); }}
                  >
                    Reset
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#ef4444' }}
                    onClick={() => { onDelete(category.id); setShowMenu(false); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-2xl font-bold text-white">${spent.toFixed(2)}</span>
          <span className="text-sm" style={{ color: '#666' }}>/ ${limit.toFixed(2)}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <ProgressBar spent={spent} limit={limit} />
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: '#555' }}>{pct.toFixed(0)}%</span>
            <span className="text-xs" style={{ color: '#555' }}>
              {isFull ? 'Over budget' : `$${Math.max(0, limit - spent).toFixed(2)} left`}
            </span>
          </div>
        </div>

        {/* Add expense button */}
        <button
          disabled={isFull}
          onClick={() => setShowExpenseModal(true)}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: isFull ? '#111' : '#2a2a2a',
            border: `1px solid ${isFull ? '#1f1f1f' : '#3a3a3a'}`,
            color: isFull ? '#444' : '#fff',
            cursor: isFull ? 'not-allowed' : 'pointer',
          }}
        >
          {isFull ? 'Budget Full' : '+ Add Expense'}
        </button>

        {/* Recent entries */}
        {category.entries.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #222' }}>
            <p className="text-xs mb-2" style={{ color: '#555' }}>Recent</p>
            <div className="flex flex-col gap-2">
              {category.entries.slice(0, 3).map(entry => (
                <div key={entry.id} className="flex justify-between items-center">
                  <span className="text-xs truncate max-w-40" style={{ color: '#888' }}>
                    {entry.note || 'No note'}
                  </span>
                  <span className="text-xs font-medium text-white ml-2 shrink-0">
                    ${entry.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showExpenseModal && (
        <AddExpenseModal
          category={category}
          onClose={() => setShowExpenseModal(false)}
          onSave={(amount, note, date) => onAddExpense(category.id, amount, note, date)}
        />
      )}

      {showEditModal && (
        <AddCategoryModal
          initial={category}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => onEdit(category.id, data)}
        />
      )}
    </>
  );
}
