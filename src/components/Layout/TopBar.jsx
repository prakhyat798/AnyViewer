import { useContext, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, Sun, Moon, FolderOpen, X } from 'lucide-react';
import { AppContext, ThemeContext } from '../../App';

export default function TopBar() {
  const {
    currentPage, currentFile, setSidebarMobileOpen,
    openFile, searchQuery, setSearchQuery,
  } = useContext(AppContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const fileInputRef = useRef(null);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'home': return 'Home';
      case 'viewer': return currentFile?.name || 'Document Viewer';
      case 'scanner': return 'Scanner';
      case 'settings': return 'Settings';
      default: return 'NovaDocs';
    }
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      openFile({
        name: file.name,
        type: file.type,
        size: file.size,
        extension: ext,
        data: file,
        url: URL.createObjectURL(file),
      });
    }
    e.target.value = '';
  }, [openFile]);

  return (
    <motion.header
      className="topbar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
    >
      <div className="topbar__left">
        {/* Mobile menu button */}
        <motion.button
          className="topbar__icon-btn topbar__menu-btn"
          onClick={() => setSidebarMobileOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          id="mobile-menu-btn"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </motion.button>

        <div className="topbar__breadcrumb">
          <span>NovaDocs</span>
          <span className="topbar__breadcrumb-sep">/</span>
          <span className="topbar__breadcrumb-current">{getPageTitle()}</span>
        </div>
      </div>

      <div className="topbar__center">
        <motion.div className="topbar__search" whileFocus={{ scale: 1.02 }}>
          <Search size={16} className="topbar__search-icon" />
          <input
            type="text"
            className="topbar__search-input"
            placeholder={currentPage === 'viewer' ? 'Search in file...' : 'Search recent files...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="search-input"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                className="topbar__search-clear"
                onClick={() => setSearchQuery('')}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="topbar__right">
        <motion.button
          className="topbar__icon-btn"
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Open File"
          id="open-file-btn"
        >
          <FolderOpen size={20} />
        </motion.button>

        <motion.button
          className="theme-toggle"
          onClick={toggleTheme}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9, rotate: -15 }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle-btn"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml,.html,.htm,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp"
        />
      </div>
    </motion.header>
  );
}
