import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon, Sun, Info, Trash2, Type, Minus, Plus,
  Keyboard, Monitor, FileText, Layers, ScanLine,
} from 'lucide-react';
import { ThemeContext, AppContext } from '../../App';

const SHORTCUTS = [
  { keys: ['←', '↑'], action: 'Previous page (PDF)' },
  { keys: ['→', '↓'], action: 'Next page (PDF)' },
  { keys: ['Esc'], action: 'Close current file' },
  { keys: ['Ctrl', '+'], action: 'Zoom in' },
  { keys: ['Ctrl', '−'], action: 'Zoom out' },
];

export default function SettingsPage() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { recentFiles, navigate } = useContext(AppContext);
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('novadocs-fontsize') || '16', 10);
  });
  const [density, setDensity] = useState(() => {
    return localStorage.getItem('novadocs-density') || 'comfortable';
  });

  const handleFontSize = (delta) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 12), 22);
      localStorage.setItem('novadocs-fontsize', String(next));
      document.documentElement.style.fontSize = next + 'px';
      return next;
    });
  };

  const handleDensity = (d) => {
    setDensity(d);
    localStorage.setItem('novadocs-density', d);
  };

  const clearRecentFiles = () => {
    // Dispatch a custom event that App.jsx listens to
    window.dispatchEvent(new CustomEvent('novadocs:clearRecent'));
  };

  return (
    <motion.div
      className="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <h1 className="settings__title">Settings</h1>

      {/* ── Appearance ── */}
      <motion.div className="settings__section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <div className="settings__section-title">
          <Monitor size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Appearance
        </div>

        {/* Dark mode toggle */}
        <motion.div className="settings__item" whileHover={{ scale: 1.01 }}>
          <div>
            <div className="settings__item-label">
              {theme === 'dark'
                ? <Moon size={15} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                : <Sun size={15} style={{ marginRight: 8, verticalAlign: 'middle' }} />}
              Dark Mode
            </div>
            <div className="settings__item-desc">Switch between dark and light themes</div>
          </div>
          <motion.div
            className={`toggle ${theme === 'dark' ? 'toggle--active' : ''}`}
            onClick={toggleTheme}
            whileTap={{ scale: 0.95 }}
          >
            <div className="toggle__thumb" />
          </motion.div>
        </motion.div>

        {/* Font size */}
        <div className="settings__item" style={{ cursor: 'default' }}>
          <div>
            <div className="settings__item-label">
              <Type size={15} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Base Font Size
            </div>
            <div className="settings__item-desc">Adjust the reading font size ({fontSize}px)</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.button
              className="btn btn--ghost btn--icon btn--sm"
              onClick={() => handleFontSize(-1)}
              disabled={fontSize <= 12}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            ><Minus size={14} /></motion.button>
            <span style={{ minWidth: 28, textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{fontSize}</span>
            <motion.button
              className="btn btn--ghost btn--icon btn--sm"
              onClick={() => handleFontSize(1)}
              disabled={fontSize >= 22}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            ><Plus size={14} /></motion.button>
          </div>
        </div>

        {/* Density */}
        <div className="settings__item" style={{ cursor: 'default' }}>
          <div>
            <div className="settings__item-label">Layout Density</div>
            <div className="settings__item-desc">Controls spacing of UI elements</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['compact', 'comfortable', 'spacious'].map(d => (
              <motion.button
                key={d}
                className={`btn btn--sm ${density === d ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => handleDensity(d)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{ textTransform: 'capitalize', minWidth: 86 }}
              >
                {d}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Recent Files ── */}
      <motion.div className="settings__section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
        <div className="settings__section-title">
          <FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Recent Files
        </div>

        <div className="settings__item" style={{ cursor: 'default' }}>
          <div>
            <div className="settings__item-label">Saved Documents</div>
            <div className="settings__item-desc">{recentFiles.length} file{recentFiles.length !== 1 ? 's' : ''} in history (max 20)</div>
          </div>
          <motion.button
            className="btn btn--sm btn--danger"
            onClick={clearRecentFiles}
            disabled={recentFiles.length === 0}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ opacity: recentFiles.length === 0 ? 0.4 : 1 }}
          >
            <Trash2 size={14} />
            Clear All
          </motion.button>
        </div>
      </motion.div>

      {/* ── Keyboard Shortcuts ── */}
      <motion.div className="settings__section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="settings__section-title">
          <Keyboard size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Keyboard Shortcuts
        </div>
        <div className="settings__shortcuts">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="settings__shortcut">
              <div style={{ display: 'flex', gap: 4 }}>
                {s.keys.map(k => (
                  <span key={k} className="shortcut-key">{k}</span>
                ))}
              </div>
              <span className="settings__item-desc">{s.action}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── About ── */}
      <motion.div className="settings__section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
        <div className="settings__section-title">
          <Info size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          About
        </div>
        <div className="settings__item" style={{ cursor: 'default' }}>
          <div>
            <div className="settings__item-label">
              <Layers size={15} style={{ marginRight: 8, verticalAlign: 'middle', color: 'var(--accent)' }} />
              NovaDocs
            </div>
            <div className="settings__item-desc">Universal Document Viewer &amp; Scanner · OxygenOS 16 Liquid Glass</div>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.813rem' }}>v1.0.0</span>
        </div>
        <div className="settings__item" style={{ cursor: 'default' }}>
          <div>
            <div className="settings__item-label">Supported Formats</div>
            <div className="settings__item-desc">
              PDF · DOCX · XLSX · CSV · PPTX · Images (JPG PNG GIF WebP SVG) · TXT · JSON · XML · HTML · MD
            </div>
          </div>
        </div>
        <div className="settings__item" style={{ cursor: 'default' }}>
          <div>
            <div className="settings__item-label">
              <ScanLine size={15} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Scanner Features
            </div>
            <div className="settings__item-desc">
              Camera capture · Image import · 4 filters · Multi-page · PDF export
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
