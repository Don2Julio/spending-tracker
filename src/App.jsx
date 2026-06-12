import { useState } from 'react';
import { useCategories } from './hooks/useCategories';
import CategoryCard from './components/CategoryCard';
import Dashboard from './components/Dashboard';
import AddCategoryModal from './components/AddCategoryModal';

export default function App() {
  const {
    categories,
    addCategory,
    editCategory,
    deleteCategory,
    addExpense,
    resetCategory,
    getTimeUntilReset,
  } = useCategories();

  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Spending Tracker</h1>
            <p className="text-sm mt-0.5" style={{ color: '#555' }}>
              {categories.length === 0 ? 'No categories yet' : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
          >
            + Add Category
          </button>
        </div>

        {/* Dashboard summary */}
        <Dashboard categories={categories} />

        {/* Empty state */}
        {categories.length === 0 && (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ backgroundColor: '#111', border: '1px dashed #2a2a2a' }}
          >
            <p className="text-4xl mb-3">💸</p>
            <p className="font-medium text-white mb-1">No categories yet</p>
            <p className="text-sm mb-5" style={{ color: '#555' }}>Create a category to start tracking your spending</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
            >
              + Add Category
            </button>
          </div>
        )}

        {/* Category grid */}
        {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                timeUntilReset={getTimeUntilReset(cat)}
                onAddExpense={addExpense}
                onEdit={editCategory}
                onDelete={deleteCategory}
                onReset={resetCategory}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={addCategory}
        />
      )}
    </div>
  );
}
