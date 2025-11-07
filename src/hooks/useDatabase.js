import { useState, useEffect } from 'react';
import { initDatabase, loadAllActions, getCategoryStats, queryOne } from '../utils/database';

export function useDatabase() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allActions, setAllActions] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [totalActions, setTotalActions] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        await initDatabase();

        const actions = loadAllActions();
        setAllActions(actions);
        setTotalActions(actions.length);

        const stats = getCategoryStats();
        setCategoryStats(stats);

        const latest = queryOne('SELECT date FROM actions ORDER BY date DESC LIMIT 1');
        if (latest) {
          setLastUpdate(latest.date);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading database:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return {
    loading,
    error,
    allActions,
    categoryStats,
    lastUpdate,
    totalActions
  };
}
