import { useContext, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn, ZoomOut, RotateCw, Download, X,
} from 'lucide-react';
import { AppContext, ToastContext } from '../../App';
import PDFViewer from './PDFViewer';
import DocxViewer from './DocxViewer';
import SpreadsheetViewer from './SpreadsheetViewer';
import ImageViewer from './ImageViewer';
import TextViewer from './TextViewer';
import PPTXViewer from './PPTXViewer';

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
const textExtensions = ['txt', 'md', 'json', 'xml', 'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'rb', 'go', 'rs', 'php', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'log', 'sh', 'bat', 'ps1'];
const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];
const docExtensions = ['doc', 'docx'];
const pptExtensions = ['ppt', 'pptx'];

function getViewerType(ext) {
  if (ext === 'pdf') return 'pdf';
  if (docExtensions.includes(ext)) return 'docx';
  if (spreadsheetExtensions.includes(ext)) return 'spreadsheet';
  if (imageExtensions.includes(ext)) return 'image';
  if (pptExtensions.includes(ext)) return 'pptx';
  if (textExtensions.includes(ext)) return 'text';
  return 'text';
}

function formatSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0, s = bytes;
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
  return `${s.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

const typeLabels = {
  pdf: 'PDF', docx: 'DOCX', spreadsheet: 'Spreadsheet',
  image: 'Image', pptx: 'PPTX', text: 'Text',
};

export default function DocumentViewer() {
  const { currentFile, closeFile } = useContext(AppContext);
  const { addToast } = useContext(ToastContext);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const viewerType = useMemo(() => {
    if (!currentFile) return null;
    return getViewerType(currentFile.extension);
  }, [currentFile]);

  if (!currentFile) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    if (currentFile.url) {
      const a = document.createElement('a');
      a.href = currentFile.url;
      a.download = currentFile.name;
      a.click();
      addToast({ type: 'success', title: 'Downloaded', message: currentFile.name });
    }
  };

  const renderViewer = () => {
    switch (viewerType) {
      case 'pdf':         return <PDFViewer file={currentFile} zoom={zoom} />;
      case 'docx':        return <DocxViewer file={currentFile} />;
      case 'spreadsheet': return <SpreadsheetViewer file={currentFile} />;
      case 'image':       return <ImageViewer file={currentFile} zoom={zoom} rotation={rotation} />;
      case 'pptx':        return <PPTXViewer file={currentFile} />;
      case 'text':        return <TextViewer file={currentFile} />;
      default:
        return (
          <div className="empty-state">
            <div className="empty-state__title">Unsupported format</div>
            <div className="empty-state__text">This file type is not supported yet.</div>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="viewer"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Toolbar */}
      <div className="viewer__toolbar">
        <div className="viewer__toolbar-group">
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={closeFile}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Close (Esc)"
            id="viewer-close-btn"
          >
            <X size={18} />
          </motion.button>
          <span className="viewer__filename">{currentFile.name}</span>
          <span className="viewer__badge">{typeLabels[viewerType] || currentFile.extension?.toUpperCase()}</span>
          {currentFile.size > 0 && (
            <span className="viewer__filesize">{formatSize(currentFile.size)}</span>
          )}
        </div>

        <div className="viewer__toolbar-group">
          {viewerType === 'pdf' && (
            <>
              <motion.button
                className="btn btn--ghost btn--icon btn--sm"
                onClick={handleZoomOut}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Zoom Out"
              ><ZoomOut size={16} /></motion.button>
              <span className="viewer__page-info">{zoom}%</span>
              <motion.button
                className="btn btn--ghost btn--icon btn--sm"
                onClick={handleZoomIn}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Zoom In"
              ><ZoomIn size={16} /></motion.button>
              <div className="viewer__toolbar-divider" />
            </>
          )}
          {viewerType === 'image' && (
            <>
              <motion.button
                className="btn btn--ghost btn--icon btn--sm"
                onClick={handleRotate}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Rotate"
              ><RotateCw size={16} /></motion.button>
              <div className="viewer__toolbar-divider" />
            </>
          )}
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={handleDownload}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Download"
          ><Download size={16} /></motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="viewer__content">
        {renderViewer()}
      </div>
    </motion.div>
  );
}
