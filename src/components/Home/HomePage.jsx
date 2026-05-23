import { useContext, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ScanLine,
  FileText,
  FileSpreadsheet,
  Image,
  File,
  Sparkles,
} from 'lucide-react';
import { AppContext } from '../../App';

const fileTypeConfig = {
  pdf:  { icon: FileText,        color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)',  label: 'PDF' },
  doc:  { icon: FileText,        color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Word' },
  docx: { icon: FileText,        color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Word' },
  xls:  { icon: FileSpreadsheet, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)',  label: 'Excel' },
  xlsx: { icon: FileSpreadsheet, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)',  label: 'Excel' },
  csv:  { icon: FileSpreadsheet, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)',  label: 'CSV' },
  ppt:  { icon: File,            color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'PowerPoint' },
  pptx: { icon: File,            color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'PowerPoint' },
  jpg:  { icon: Image,           color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Image' },
  jpeg: { icon: Image,           color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Image' },
  png:  { icon: Image,           color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Image' },
  gif:  { icon: Image,           color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Image' },
  webp: { icon: Image,           color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Image' },
  svg:  { icon: Image,           color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Image' },
  txt:  { icon: FileText,        color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'Text' },
  md:   { icon: FileText,        color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'Markdown' },
  json: { icon: FileText,        color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', label: 'JSON' },
  xml:  { icon: FileText,        color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'XML' },
  html: { icon: FileText,        color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)',  label: 'HTML' },
};

const defaultConfig = { icon: File, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'File' };

export function getFileConfig(ext) {
  return fileTypeConfig[ext?.toLowerCase()] || defaultConfig;
}

export function formatFileSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr), now = new Date();
  const diffMins = Math.floor((now - d) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
};

export default function HomePage({ searchQuery = '' }) {
  const { navigate, openFile, recentFiles } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      openFile({ name: file.name, type: file.type, size: file.size, extension: ext, data: file, url: URL.createObjectURL(file) });
    }
    if (e.target) e.target.value = '';
  }, [openFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      openFile({ name: file.name, type: file.type, size: file.size, extension: ext, data: file, url: URL.createObjectURL(file) });
    }
  }, [openFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  // Filter recent files by search query
  const filteredRecent = searchQuery.trim()
    ? recentFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentFiles;

  const showSearch = searchQuery.trim().length > 0;

  return (
    <motion.div
      className="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Hero — hide when searching */}
      {!showSearch && (
        <>
          <motion.div
            className="home__hero"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
          >
            <h1 className="home__hero-title">
              <span className="text-gradient">View Any Document.</span>
              <br />
              <span className="text-gradient">Scan Anything.</span>
            </h1>
            <p className="home__hero-subtitle">
              Open PDFs, Word docs, spreadsheets, images, and more — or scan physical documents with your camera.
            </p>

            <motion.div
              className="home__actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.button
                className="btn btn--primary btn--lg"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                id="hero-open-file-btn"
              >
                <Upload size={20} /> Open File
              </motion.button>
              <motion.button
                className="btn btn--secondary btn--lg"
                onClick={() => navigate('scanner')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                id="hero-scanner-btn"
              >
                <ScanLine size={20} /> Start Scanner
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Drop Zone */}
          <motion.div
            className={`dropzone ${isDragOver ? 'dropzone--active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.01 }}
            id="file-drop-zone"
          >
            <motion.div
              className="dropzone__icon"
              animate={isDragOver ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Sparkles size={48} />
            </motion.div>
            <p className="dropzone__text"><strong>Drop files here</strong> or click to browse</p>
            <p className="dropzone__formats">PDF · DOCX · XLSX · PPTX · Images · TXT · CSV · JSON · HTML · MD</p>
          </motion.div>
        </>
      )}

      {/* Search results indicator */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="recent-section__header"
          style={{ marginBottom: 16 }}
        >
          <h2 className="recent-section__title">
            Search: &ldquo;{searchQuery}&rdquo;
            {' '}
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.9rem' }}>
              — {filteredRecent.length} result{filteredRecent.length !== 1 ? 's' : ''}
            </span>
          </h2>
        </motion.div>
      )}

      {/* Recent / Search Results */}
      {filteredRecent.length > 0 && (
        <motion.section
          className="recent-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showSearch ? 0 : 0.5 }}
        >
          {!showSearch && (
            <div className="recent-section__header">
              <h2 className="recent-section__title">Recent Documents</h2>
            </div>
          )}

          <motion.div
            className="recent-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredRecent.map((file, index) => {
                const config = getFileConfig(file.extension);
                const IconComp = config.icon;
                return (
                  <motion.div
                    key={file.name + index}
                    className="glass-card"
                    variants={itemVariants}
                    onClick={() => openFile(file)}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="glass-card__icon" style={{ background: config.bg, color: config.color }}>
                      <IconComp size={24} />
                    </div>
                    <div className="glass-card__title">{file.name}</div>
                    <div className="glass-card__meta">
                      {config.label}
                      {file.size ? ` · ${formatFileSize(file.size)}` : ''}
                      {file.openedAt ? ` · ${formatDate(file.openedAt)}` : ''}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </motion.section>
      )}

      {/* Empty search result */}
      {showSearch && filteredRecent.length === 0 && (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <File size={48} style={{ opacity: 0.3 }} />
          <div className="empty-state__title">No results found</div>
          <div className="empty-state__text">No recent files match &ldquo;{searchQuery}&rdquo;</div>
        </motion.div>
      )}

      {/* Supported formats showcase when no files and not searching */}
      {!showSearch && recentFiles.length === 0 && (
        <motion.section
          className="recent-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="recent-section__header">
            <h2 className="recent-section__title">Supported Formats</h2>
          </div>
          <motion.div className="recent-grid" variants={containerVariants} initial="hidden" animate="visible">
            {[
              { ext: 'pdf',  name: 'PDF Documents',  desc: 'View & navigate multi-page PDFs' },
              { ext: 'docx', name: 'Word Documents',  desc: 'Read DOCX files beautifully' },
              { ext: 'xlsx', name: 'Spreadsheets',   desc: 'Excel & CSV with sheet tabs' },
              { ext: 'jpg',  name: 'Images',          desc: 'JPG, PNG, GIF, WebP, SVG' },
              { ext: 'txt',  name: 'Text & Code',     desc: 'TXT, JSON, XML, HTML, MD' },
              { ext: 'pptx', name: 'Presentations',   desc: 'PowerPoint slide viewer' },
            ].map((item) => {
              const config = getFileConfig(item.ext);
              const IconComp = config.icon;
              return (
                <motion.div
                  key={item.ext}
                  className="glass-card"
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  style={{ cursor: 'default' }}
                >
                  <div className="glass-card__icon" style={{ background: config.bg, color: config.color }}>
                    <IconComp size={24} />
                  </div>
                  <div className="glass-card__title">{item.name}</div>
                  <div className="glass-card__meta">{item.desc}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml,.html,.htm,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp"
      />
    </motion.div>
  );
}
