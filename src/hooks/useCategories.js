import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function getNextResetDate(lastReset, period) {
  const d = new Date(lastReset)
  switch (period) {
    case 'Weekly':  return new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000)
    case 'Monthly': return new Date(d.getFullYear(), d.getMonth() + 1, 1)
    case 'Annually':return new Date(d.getFullYear() + 1, 0, 1)
    default:        return new Date(d.getFullYear(), d.getMonth() + 1, 1)
  }
}

function shouldAutoReset(cat) {
  return new Date() >= getNextResetDate(cat.last_reset, cat.reset_period)
}

// Shape a raw Supabase row into what the UI expects
function shapeCategory(row, entries = []) {
  const relevantEntries = entries.filter(e => e.category_id === row.id)
  const spent = relevantEntries.reduce((sum, e) => sum + Number(e.amount), 0)
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji || '',
    limit: Number(row.budget_limit),
    resetPeriod: row.reset_period,
    lastReset: row.last_reset,
    spent,
    entries: relevantEntries.map(e => ({
      id: e.id,
      amount: Number(e.amount),
      note: e.note || '',
      date: e.date,
    })).sort((a, b) => new Date(b.date) - new Date(a.date)),
  }
}

export function useCategories(userId) {
  const [categories, setCategories] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    setLoading(true)

    async function loadAll() {
      const [{ data: cats }, { data: ents }] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
      ])
      const catsData = cats || []
      const entsData = ents || []

      // Auto-reset any overdue categories
      const now = new Date().toISOString()
      const toReset = catsData.filter(shouldAutoReset)
      if (toReset.length > 0) {
        await Promise.all(toReset.map(cat => {
          const next = getNextResetDate(cat.last_reset, cat.reset_period)
          return supabase.from('categories').update({ last_reset: next.toISOString() })
            .eq('id', cat.id)
        }))
        // Also delete their old entries since they've been reset
        await Promise.all(toReset.map(cat =>
          supabase.from('entries').delete().eq('category_id', cat.id)
        ))
        // Reload
        const [{ data: freshCats }, { data: freshEnts }] = await Promise.all([
          supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
          supabase.from('entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
        ])
        setCategories(freshCats || [])
        setEntries(freshEnts || [])
      } else {
        setCategories(catsData)
        setEntries(entsData)
      }
      setLoading(false)
    }

    loadAll()
  }, [userId])

  // ── Real-time subscriptions ───────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const catSub = supabase
      .channel('categories-changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'categories',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setCategories(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setCategories(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
        } else if (payload.eventType === 'DELETE') {
          setCategories(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    const entSub = supabase
      .channel('entries-changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'entries',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setEntries(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setEntries(prev => prev.filter(e => e.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(catSub)
      supabase.removeChannel(entSub)
    }
  }, [userId])

  // ── Derived shaped categories ─────────────────────────────────────────────
  const shapedCategories = categories.map(cat => shapeCategory(cat, entries))

  // ── Actions ───────────────────────────────────────────────────────────────
  const addCategory = useCallback(async (data) => {
    await supabase.from('categories').insert({
      user_id: userId,
      name: data.name,
      emoji: data.emoji || '',
      budget_limit: parseFloat(data.limit),
      reset_period: data.resetPeriod,
      last_reset: data.lastReset || new Date().toISOString(),
    })
  }, [userId])

  const editCategory = useCallback(async (id, data) => {
    await supabase.from('categories').update({
      name: data.name,
      emoji: data.emoji || '',
      budget_limit: parseFloat(data.limit),
      reset_period: data.resetPeriod,
      last_reset: data.lastReset,
    }).eq('id', id)
  }, [])

  const deleteCategory = useCallback(async (id) => {
    await supabase.from('entries').delete().eq('category_id', id)
    await supabase.from('categories').delete().eq('id', id)
  }, [])

  const addExpense = useCallback(async (categoryId, amount, note, date) => {
    await supabase.from('entries').insert({
      category_id: categoryId,
      user_id: userId,
      amount: parseFloat(amount),
      note: note || '',
      date: date || new Date().toISOString(),
    })
  }, [userId])

  const resetCategory = useCallback(async (id) => {
    await supabase.from('entries').delete().eq('category_id', id)
    await supabase.from('categories').update({
      last_reset: new Date().toISOString(),
    }).eq('id', id)
  }, [])

  const getTimeUntilReset = useCallback((category) => {
    const next = getNextResetDate(category.lastReset, category.resetPeriod)
    const diffMs = next - new Date()
    if (diffMs <= 0) return 'Resets now'
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `Resets in ${days}d`
    return `Resets in ${hours}h`
  }, [])

  return {
    categories: shapedCategories,
    loading,
    addCategory,
    editCategory,
    deleteCategory,
    addExpense,
    resetCategory,
    getTimeUntilReset,
  }
}
