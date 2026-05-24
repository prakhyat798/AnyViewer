import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Presentation, RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * PPTXViewer — Uses Google Docs Viewer for pixel-perfect PPTX rendering.
 *
 * How it works:
 * 1. Upload the file to a temporary hosting service (auto-deletes in ~60 min)
 * 2. Embed Google Docs Viewer iframe with the temporary URL
 * 3. Google renders the PPTX exactly as PowerPoint would
 */

// Temporary file upload to get a public URL for Google Docs Viewer
async function uploadToTempHost(file) {
  const formData = new FormData();

  // Get the actual File/Blob object
  let blob;
  if (file.data instanceof File || file.data instanceof Blob) {
    blob = file.data;
  } else if (file.url) {
    const res = await fetch(file.url);
    blob = await res.blob();
  } else {
    throw new Error('No file data available');
  }

  formData.append('file', blob, file.name);

  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.status !== 'success' || !result.data?.url) {
    throw new Error('Upload failed: unexpected response');
  }

  // tmpfiles.org returns URL like https://tmpfiles.org/12345/file.pptx
  // Direct download URL is https://tmpfiles.org/dl/12345/file.pptx
  const url = result.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
  return url;
}

export default function PPTXViewer({ file }) {
  const [publicUrl, setPublicUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPublicUrl(null);
    setIframeLoaded(false);

    uploadToTempHost(file)
      .then((url) => {
        if (!cancelled) {
          setPublicUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to prepare file for viewing');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [file]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setPublicUrl(null);
    setIframeLoaded(false);

    uploadToTempHost(file)
      .then((url) => {
        setPublicUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to prepare file for viewing');
        setLoading(false);
      });
  }, [file]);

  if (loading) {
    return (
      <div className="pdf-viewer__loading" style={{ flexDirection: 'column', gap: '12px' }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Preparing presentation...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <AlertTriangle size={48} style={{ color: 'var(--warning)' }} />
        <div className="empty-state__title">Could not load presentation</div>
        <div className="empty-state__text">{error}</div>
        <motion.button
          className="btn btn--primary btn--sm"
          onClick={handleRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ marginTop: '16px' }}
        >
          <RefreshCw size={16} /> Try Again
        </motion.button>
      </div>
    );
  }

  if (!publicUrl) return null;

  // Google Docs Viewer iframe URL
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(publicUrl)}&embedded=true`;

  return (
    <div className="pptx-viewer">
      <div className="pptx-viewer__slide-wrapper">
        {/* Show spinner until iframe loads */}
        {!iframeLoaded && (
          <div className="pdf-viewer__loading" style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
            flexDirection: 'column', gap: '12px',
          }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Rendering with Google Docs...
            </span>
          </div>
        )}
        <iframe
          src={viewerUrl}
          className="pptx-viewer__canvas"
          title="Presentation Viewer"
          onLoad={() => setIframeLoaded(true)}
          style={{
            border: 'none',
            width: '100%',
            height: '75vh',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            background: '#fff',
          }}
          allowFullScreen
        />
      </div>
    </div>
  );
}
