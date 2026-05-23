import { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  ScanLine,
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { AppContext } from '../../App';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scanner', label: 'Scanner', icon: ScanLine },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const {
    currentPage,
    navigate,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarMobileOpen,
    recentFiles,
    openFile,
  } = useContext(AppContext);

  const sidebarClass = [
    'sidebar',
    sidebarCollapsed && 'sidebar--collapsed',
    sidebarMobileOpen && 'sidebar--mobile-open',
  ].filter(Boolean).join(' ');

  return (
    <motion.aside
      className={sidebarClass}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Header */}
      <div className="sidebar__header">
        <motion.div
          className="sidebar__logo"
          whileHover={{ scale: 1.05, rotate: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <Layers size={22} />
        </motion.div>
        {!sidebarCollapsed && (
          <motion.span
            className="sidebar__title"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
          >
            AnyViewer
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__section-title">
          {!sidebarCollapsed && 'Navigation'}
        </div>
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            className={`sidebar__nav-item ${currentPage === item.id ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => navigate(item.id)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.05,
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97, x: 4 }}
          >
            <item.icon className="sidebar__nav-icon" size={20} />
            <span className="sidebar__nav-label">{item.label}</span>
          </motion.button>
        ))}

        {/* Recent files */}
        {!sidebarCollapsed && recentFiles.length > 0 && (
          <>
            <div className="sidebar__section-title" style={{ marginTop: '8px' }}>
              <Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Recent
            </div>
            {recentFiles.slice(0, 5).map((file, index) => (
              <motion.button
                key={file.name + index}
                className="sidebar__nav-item"
                onClick={() => openFile(file)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 + index * 0.04,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
              >
                <FileText className="sidebar__nav-icon" size={16} />
                <span className="sidebar__nav-label" style={{ fontSize: '0.8rem' }}>
                  {file.name}
                </span>
              </motion.button>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <motion.button
          className="sidebar__collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
