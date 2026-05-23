import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function PDFViewer({ file, zoom = 100 }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setCurrentPage(1);
    setPageInput('1');
  }, []);

  const goToPrevPage = useCallback(() => {
    setCurrentPage(prev => {
      const next = Math.max(prev - 1, 1);
      setPageInput(String(next));
      return next;
    });
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => {
      const next = Math.min(prev + 1, numPages || 1);
      setPageInput(String(next));
      return next;
    });
  }, [numPages]);

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= (numPages || 1)) {
      setCurrentPage(parsed);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
      inputRef.current?.blur();
    }
  };

  // Keyboard arrow navigation
  useEffect(() => {
    const handleKey = (e) => {
      // Don't intercept if user is typing in the page input
      if (document.activeElement === inputRef.current) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToNextPage();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPrevPage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goToNextPage, goToPrevPage]);

  return (
    <div className="pdf-viewer">
      <Document
        file={file.url || file.data}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="pdf-viewer__loading">
            <div className="spinner" />
          </div>
        }
        error={
          <div className="empty-state">
            <div className="empty-state__title">Failed to load PDF</div>
            <div className="empty-state__text">The file may be corrupted or encrypted.</div>
          </div>
        }
      >
        <motion.div
          className="pdf-viewer__page"
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          <Page
            pageNumber={currentPage}
            width={Math.min(800, window.innerWidth - 100)}
            renderAnnotationLayer={true}
            renderTextLayer={true}
          />
        </motion.div>
      </Document>

      {/* Page navigation */}
      {numPages && numPages > 1 && (
        <motion.div
          className="pdf-viewer__nav"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ opacity: currentPage <= 1 ? 0.3 : 1 }}
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
            <span>Page</span>
            <input
              ref={inputRef}
              className="pdf-viewer__page-input"
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
            />
            <span>of {numPages}</span>
          </div>

          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ opacity: currentPage >= numPages ? 0.3 : 1 }}
          >
            <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
