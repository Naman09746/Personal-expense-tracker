import { useState, useCallback, useEffect } from 'react';
import Home from './pages/Home';
import History from './pages/History';
import AddEntry from './pages/AddEntry';
import Settings from './pages/Settings';
import Insights from './pages/Insights';
import { initTheme } from './services/storage';
import type { Entry } from './types';
import './index.css';

type Tab = 'home' | 'insights' | 'history' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(function () {
    initTheme();
  }, []);

  const handleAddEntry = useCallback(function () {
    setEditEntry(null);
    setShowAddEntry(true);
  }, []);

  const handleEditEntry = useCallback(function (entry: Entry) {
    setEditEntry(entry);
    setShowAddEntry(true);
  }, []);

  const handleCloseEntry = useCallback(function () {
    setShowAddEntry(false);
    setEditEntry(null);
  }, []);

  const handleSaveEntry = useCallback(function () {
    setRefreshKey(function (prev) { return prev + 1; });
  }, []);

  const handleRefresh = handleSaveEntry;

  return (
    <div className="app">
      {activeTab === 'home' && (
        <Home
          onAddEntry={handleAddEntry}
          refreshKey={refreshKey}
        />
      )}
      {activeTab === 'insights' && (
        <Insights refreshKey={refreshKey} />
      )}
      {activeTab === 'history' && (
        <History
          onEditEntry={handleEditEntry}
          refreshKey={refreshKey}
          onRefresh={handleRefresh}
        />
      )}
      {activeTab === 'settings' && (
        <Settings />
      )}

      {showAddEntry && (
        <AddEntry
          onClose={handleCloseEntry}
          onSave={handleSaveEntry}
          editEntry={editEntry}
        />
      )}

      <nav className="bottom-nav">
        <button
          className={'nav-btn ' + (activeTab === 'home' ? 'active' : '')}
          onClick={function () { setActiveTab('home'); }}
        >
          <span className="nav-icon">📊</span>
          <span>Home</span>
        </button>
        <button
          className={'nav-btn ' + (activeTab === 'insights' ? 'active' : '')}
          onClick={function () { setActiveTab('insights'); }}
        >
          <span className="nav-icon">💡</span>
          <span>Insights</span>
        </button>
        <button
          className={'nav-btn ' + (activeTab === 'history' ? 'active' : '')}
          onClick={function () { setActiveTab('history'); }}
        >
          <span className="nav-icon">📝</span>
          <span>History</span>
        </button>
        <button
          className={'nav-btn ' + (activeTab === 'settings' ? 'active' : '')}
          onClick={function () { setActiveTab('settings'); }}
        >
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;

