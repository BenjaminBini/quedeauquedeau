import { useState, useMemo } from 'react';
import { Tabs, Tab, Spinner } from '@heroui/react';
import { useDatabase } from './hooks/useDatabase';
import { Dashboard } from './components/Dashboard';
import { Timeline } from './components/Timeline';
import { Browse } from './components/Browse';
import { Categories } from './components/Categories';

function App() {
  const { loading, error, allActions, categoryStats, lastUpdate, totalActions } = useDatabase();
  const [selectedView, setSelectedView] = useState('dashboard');

  const dateRange = useMemo(() => {
    if (allActions.length === 0) return 'Loading...';

    const dates = allActions.map(a => new Date(a.date));
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return `${formatDate(earliest)} - ${formatDate(latest)}`;
  }, [allActions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-600">
        <div className="text-center">
          <Spinner size="lg" color="white" />
          <p className="text-white mt-4 text-lg">Loading database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-600">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error Loading Database</h2>
          <p>{error}</p>
          <p className="mt-4">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-red-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Trump Actions Tracker</h1>
          <p className="text-lg opacity-95">
            Documenting threats to democracy, institutions, and civil rights
          </p>
        </div>
      </header>

      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs
            selectedKey={selectedView}
            onSelectionChange={setSelectedView}
            color="danger"
            variant="underlined"
            classNames={{
              tabList: "w-full",
              tab: "text-base font-medium py-4",
            }}
          >
            <Tab key="dashboard" title="Dashboard" />
            <Tab key="timeline" title="Timeline" />
            <Tab key="browse" title="Browse All" />
            <Tab key="categories" title="By Category" />
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedView === 'dashboard' && (
          <Dashboard
            allActions={allActions}
            categoryStats={categoryStats}
            totalActions={totalActions}
            dateRange={dateRange}
          />
        )}
        {selectedView === 'timeline' && (
          <Timeline
            allActions={allActions}
            categoryStats={categoryStats}
          />
        )}
        {selectedView === 'browse' && (
          <Browse
            allActions={allActions}
            categoryStats={categoryStats}
          />
        )}
        {selectedView === 'categories' && (
          <Categories
            allActions={allActions}
            categoryStats={categoryStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-700 text-white py-8 mt-16 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-2 opacity-90">
            Data last updated: <span className="font-semibold">{lastUpdate}</span>
          </p>
          <p className="opacity-90">
            This tracker documents actions that threaten democratic norms, institutions, and civil rights.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
