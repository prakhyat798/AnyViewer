import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, WrapText } from 'lucide-react';

export default function TextViewer({ file }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadText = async () => {
      try {
        let text;
        if (file.data instanceof File || file.data instanceof Blob) {
          text = await file.data.text();
        } else if (file.url) {
          const response = await fetch(file.url);
          text = await response.text();
        } else {
          text = 'Unable to read file content.';
        }

        if (!cancelled) {
          setContent(text);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setContent('Error reading file.');
          setLoading(false);
        }
      }
    };

    loadText();
    return () => { cancelled = true; };
  }, [file]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  if (loading) {
    return (
      <div className="pdf-viewer__loading">
        <div className="spinner" />
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <motion.div
      className="text-viewer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="text-viewer__header">
        <span>{file.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>{lines.length} lines · {file.extension?.toUpperCase()}</span>
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={() => setWordWrap(p => !p)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
            style={{ color: wordWrap ? 'var(--accent-text)' : 'var(--text-tertiary)' }}
          >
            <WrapText size={14} />
          </motion.button>
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={handleCopy}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
          </motion.button>
        </div>
      </div>
      <div
        className="text-viewer__content"
        style={{
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
          overflowX: wordWrap ? 'hidden' : 'auto',
        }}
      >
        <div className="text-viewer__line-numbers">
          <div className="text-viewer__numbers">
            {lines.map((_, i) => (
              <div key={i} className="text-viewer__line-num">{i + 1}</div>
            ))}
          </div>
          <div className="text-viewer__code">
            {lines.map((line, i) => (
              <div key={i} className="text-viewer__line">{line || '\u00A0'}</div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
