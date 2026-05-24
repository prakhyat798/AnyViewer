import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react';
import { PPTXViewer as PPTXViewerLib } from 'pptx-viewer';

export default function PPTXViewer({ file }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load the presentation using the built-in PPTXViewer class
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setCurrentSlide(0);

      try {
        // Clean up previous viewer
        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }

        if (!containerRef.current) return;

        // Clear container
        containerRef.current.innerHTML = '';

        // Create the viewer with built-in controls disabled (we have our own nav)
        const viewer = new PPTXViewerLib(containerRef.current, {
          showControls: false,
          keyboardNavigation: false,
          onSlideChange: (index) => {
            if (!cancelled) setCurrentSlide(index);
          },
          onLoad: (presentation) => {
            if (!cancelled) {
              setSlideCount(presentation.slides.length);
              setLoading(false);
            }
          },
          onError: (err) => {
            if (!cancelled) {
              setError(err.message || 'Failed to load presentation');
              setLoading(false);
            }
          },
        });

        viewerRef.current = viewer;

        // Get the file source
        let source;
        if (file.data instanceof File || file.data instanceof Blob) {
          source = file.data;
        } else if (file.url) {
          source = file.url;
        } else {
          throw new Error('No file data available');
        }

        await viewer.load(source);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load presentation');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [file]);

  // Navigate slides
  const goToSlide = useCallback((index) => {
    if (!viewerRef.current) return;
    if (index < 0 || index >= slideCount) return;
    viewerRef.current.goToSlide(index);
  }, [slideCount]);

  const goNext = useCallback(() => {
    if (viewerRef.current) viewerRef.current.next();
  }, []);

  const goPrev = useCallback(() => {
    if (viewerRef.current) viewerRef.current.previous();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (error && !loading) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Failed to load presentation</div>
        <div className="empty-state__text">{error}</div>
      </div>
    );
  }

  return (
    <div className="pptx-viewer">
      {loading && (
        <div className="pdf-viewer__loading"><div className="spinner" /></div>
      )}

      {/* Slide rendered by pptx-viewer library */}
      <div className="pptx-viewer__slide-wrapper">
        {!loading && (
          <div className="pptx-viewer__slide-number">
            Slide {currentSlide + 1} / {slideCount}
          </div>
        )}
        <div
          ref={containerRef}
          className="pptx-viewer__canvas"
        />
      </div>

      {/* Navigation */}
      {!loading && slideCount > 1 && (
        <div className="pptx-viewer__nav">
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={goPrev}
            disabled={currentSlide <= 0}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ opacity: currentSlide <= 0 ? 0.3 : 1 }}
          ><ChevronLeft size={18} /></motion.button>

          <div className="pptx-viewer__thumb-strip">
            {Array.from({ length: slideCount }, (_, i) => (
              <motion.button
                key={i}
                className={`pptx-viewer__thumb ${i === currentSlide ? 'pptx-viewer__thumb--active' : ''}`}
                onClick={() => goToSlide(i)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <span className="pptx-viewer__thumb-num">{i + 1}</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={goNext}
            disabled={currentSlide >= slideCount - 1}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ opacity: currentSlide >= slideCount - 1 ? 0.3 : 1 }}
          ><ChevronRight size={18} /></motion.button>
        </div>
      )}
    </div>
  );
}
