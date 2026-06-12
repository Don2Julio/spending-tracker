import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useCategories } from './hooks/useCategories'
import AuthGate from './components/AuthGate'
import CategoryCard from './components/CategoryCard'
import Dashboard from './components/Dashboard'
import AddCategoryModal from './components/AddCategoryModal'

export default function App() {
  const { session, user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const {
    categories,
    loading: dataLoading,
    addCategory,
    editCategory,
    deleteCategory,
    addExpense,
    resetCategory,
    getTimeUntilReset,
  } = useCategories(user?.id)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // ── Auth loading splash ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    )
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!session) {
    return <AuthGate onSignIn={signInWithGoogle} />
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Spending Tracker</h1>
            <p className="text-sm mt-0.5" style={{ color: '#555' }}>
              {dataLoading ? 'Loading…' : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
            >
              + Add Category
            </button>

            {/* User avatar */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                title={user.email}
              >
                {user.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white">{(user.email || 'U')[0].toUpperCase()}</span>
                }
              </button>
              {showUserMenu && (
                <div
                  className="absolute right-0 top-11 rounded-xl py-1 z-20 min-w-48"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  <div className="px-3 py-2 border-b" style={{ borderColor: '#2a2a2a' }}>
                    <p className="text-xs font-medium text-white truncate">
                      {user.user_metadata?.full_name || 'Signed in'}
                    </p>
                    <p className="text-xs truncate" style={{ color: '#555' }}>{user.email}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: '#888' }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <Dashboard categories={categories} />

        {/* Loading skeleton */}
        {dataLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', height: 200 }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!dataLoading && categories.length === 0 && (
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
        {!dataLoading && categories.length > 0 && (
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
  )
}
