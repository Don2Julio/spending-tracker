import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'spending-tracker-data';

export function getNextResetDate(lastReset, period) {
  const d = new Date(lastReset);
  switch (period) {
    case 'Weekly':
      return new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'Monthly':
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
    case 'Annually':
      return new Date(d.getFullYear() + 1, 0, 1);
    default:
      return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
}

function shouldAutoReset(category) {
  return new Date() >= getNextResetDate(category.lastReset, category.resetPeriod);
}

function getCanonicalNextLastReset(lastReset, period) {
  // When auto-resetting, snap lastReset to the scheduled boundary, not "now"
  return getNextResetDate(lastReset, period).toISOString();
}

function applyAutoResets(categories) {
  return categories.map(cat => {
    if (shouldAutoReset(cat)) {
      return {
        ...cat,
        spent: 0,
        entries: [],
        lastReset: getCanonicalNextLastReset(cat.lastReset, cat.resetPeriod),
      };
    }
    return cat;
  });
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return applyAutoResets(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function useCategories() {
  const [categories, setCategories] = useState(() => loadFromStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCategories(prev => applyAutoResets(prev));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const addCategory = useCallback((data) => {
    const newCat = {
      id: crypto.randomUUID(),
      name: data.name,
      emoji: data.emoji || '',
      limit: parseFloat(data.limit),
      resetPeriod: data.resetPeriod,
      lastReset: data.lastReset || new Date().toISOString(),
      spent: 0,
      entries: [],
    };
    setCategories(prev => [...prev, newCat]);
  }, []);

  const editCategory = useCallback((id, data) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id
        ? {
            ...cat,
            name: data.name,
            emoji: data.emoji || '',
            limit: parseFloat(data.limit),
            resetPeriod: data.resetPeriod,
            lastReset: data.lastReset || cat.lastReset,
          }
        : cat
    ));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, []);

  const addExpense = useCallback((categoryId, amount, note, date) => {
    const entry = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      note: note || '',
      date: date || new Date().toISOString(),
    };
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, spent: cat.spent + entry.amount, entries: [entry, ...cat.entries] }
        : cat
    ));
  }, []);

  const resetCategory = useCallback((id) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id
        ? { ...cat, spent: 0, entries: [], lastReset: new Date().toISOString() }
        : cat
    ));
  }, []);

  const getTimeUntilReset = useCallback((category) => {
    const next = getNextResetDate(category.lastReset, category.resetPeriod);
    const diffMs = next - new Date();
    if (diffMs <= 0) return 'Resets now';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Resets in ${days}d`;
    return `Resets in ${hours}h`;
  }, []);

  return {
    categories,
    addCategory,
    editCategory,
    deleteCategory,
    addExpense,
    resetCategory,
    getTimeUntilReset,
  };
}
