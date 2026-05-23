import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import './App.css';

import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import HomePage from './components/Home/HomePage';
import DocumentViewer from './components/Viewer/DocumentViewer';
import ScannerView from './components/Scanner/ScannerView';
import SettingsPage from './components/Settings/SettingsPage';
import ToastContainer from './components/UI/ToastContainer';

// ─── Theme Context ───
export const ThemeContext = createContext();

// ─── Toast Context ───
export const ToastContext = createContext();

// ─── App Context (navigation, file state) ───
export const AppContext = createContext();

// ─── IndexedDB helpers ───
const DB_NAME = 'NovaDocs';
const DB_VERSION = 1;
const STORE = 'recentFiles';

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: 'name' });
    };
    req.onsuccess = (e) => res(e.target.result);
    req.onerror = (e) => rej(e.target.error);
  });
}

async function dbGetAll() {
  try {
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const files = (req.result || []).sort(
          (a, b) => new Date(b.openedAt) - new Date(a.openedAt)
        );
        res(files);
      };
      req.onerror = () => rej(req.error);
    });
  } catch { return []; }
}

async function dbPut(file) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    // Strip the File object (not serializable) — store metadata only
    const { data: _data, ...rest } = file;
    tx.objectStore(STORE).put(rest);
  } catch { /* noop */ }
}

async function dbClear() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
  } catch { /* noop */ }
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('novadocs-theme') || 'dark';
  });
  const [currentPage, setCurrentPage] = useState('home');
  const [currentFile, setCurrentFile] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [scannerScans, setScannerScans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load recent files from IndexedDB on mount
  useEffect(() => {
    dbGetAll().then(files => {
      if (files.length > 0) setRecentFiles(files);
    });
  }, []);

  // Apply saved font size on mount
  useEffect(() => {
    const saved = localStorage.getItem('novadocs-fontsize');
    if (saved) document.documentElement.style.fontSize = saved + 'px';
  }, []);

  // Listen for clearRecent event from SettingsPage
  useEffect(() => {
    const handler = () => {
      setRecentFiles([]);
      dbClear();
    };
    window.addEventListener('novadocs:clearRecent', handler);
    return () => window.removeEventListener('novadocs:clearRecent', handler);
  }, []);

  // Global keyboard shortcut: Escape closes file
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && currentFile) {
        closeFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentFile]);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('novadocs-theme', next);
      return next;
    });
  }, []);

  // Toast management
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // File handling
  const openFile = useCallback((file) => {
    setCurrentFile(file);
    setCurrentPage('viewer');
    setSearchQuery('');
    const record = {
      name: file.name,
      type: file.type,
      size: file.size,
      extension: file.extension,
      url: file.url,
      openedAt: new Date().toISOString(),
    };
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f.name !== file.name);
      return [record, ...filtered].slice(0, 20);
    });
    dbPut(record);
    addToast({
      type: 'success',
      title: 'File Opened',
      message: file.name,
    });
  }, [addToast]);

  const closeFile = useCallback(() => {
    setCurrentFile(null);
    setCurrentPage('home');
  }, []);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    setSidebarMobileOpen(false);
    setSearchQuery('');
    if (page !== 'viewer') {
      setCurrentFile(null);
    }
  }, []);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage key="home" searchQuery={searchQuery} />;
      case 'viewer':
        return currentFile ? <DocumentViewer key="viewer" /> : <HomePage key="home-fallback" searchQuery={searchQuery} />;
      case 'scanner':
        return <ScannerView key="scanner" />;
      case 'settings':
        return <SettingsPage key="settings" />;
      default:
        return <HomePage key="home-default" searchQuery={searchQuery} />;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        <AppContext.Provider value={{
          currentPage,
          currentFile,
          recentFiles,
          sidebarCollapsed,
          sidebarMobileOpen,
          scannerScans,
          searchQuery,
          navigate,
          openFile,
          closeFile,
          setSidebarCollapsed,
          setSidebarMobileOpen,
          setScannerScans,
          setSearchQuery,
        }}>
          <div className="app-shell" data-theme={theme}>
            {/* Animated background blobs */}
            <div className="app-shell__background">
              <div className="app-shell__blob app-shell__blob--1" />
              <div className="app-shell__blob app-shell__blob--2" />
              <div className="app-shell__blob app-shell__blob--3" />
            </div>

            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="app-shell__content-wrapper">
              <TopBar />
              <main className="app-shell__main">
                <AnimatePresence mode="wait">
                  {renderPage()}
                </AnimatePresence>
              </main>
            </div>

            {/* Toast notifications */}
            <ToastContainer />

            {/* Mobile sidebar overlay */}
            {sidebarMobileOpen && (
              <div
                className="sidebar-overlay"
                onClick={() => setSidebarMobileOpen(false)}
              />
            )}
          </div>
        </AppContext.Provider>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
