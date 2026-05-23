import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import mammoth from 'mammoth';

export default function DocxViewer({ file }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadDocx = async () => {
      try {
        let arrayBuffer;
        if (file.data instanceof File || file.data instanceof Blob) {
          arrayBuffer = await file.data.arrayBuffer();
        } else if (file.url) {
          const response = await fetch(file.url);
          arrayBuffer = await response.arrayBuffer();
        }

        if (cancelled) return;

        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (!cancelled) {
          setHtmlContent(result.value);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadDocx();
    return () => { cancelled = true; };
  }, [file]);

  if (loading) {
    return (
      <div className="pdf-viewer__loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Failed to load document</div>
        <div className="empty-state__text">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      className="docx-viewer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
