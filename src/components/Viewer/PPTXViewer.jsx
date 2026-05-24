import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Presentation } from 'lucide-react';
import {
  loadPresentation,
  renderSlideToElement,
  getThumbnails,
} from 'pptx-viewer';

export default function PPTXViewer({ file }) {
  const containerRef = useRef(null);
  const thumbStripRef = useRef(null);
  const presentationRef = useRef(null);
  const [slideCount, setSlideCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);

  // Load the presentation
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setCurrentSlide(0);
      setThumbnails([]);

      try {
        // Get the file source (File object or blob URL)
        let source;
        if (file.data instanceof File || file.data instanceof Blob) {
          source = file.data;
        } else if (file.url) {
          const res = await fetch(file.url);
          source = await res.arrayBuffer();
        } else {
          throw new Error('No file data available');
        }

        const presentation = await loadPresentation(source);

        if (cancelled) {
          presentation.cleanup();
          return;
        }

        presentationRef.current = presentation;
        const count = presentation.slides.length;
        setSlideCount(count);

        // Render the first slide
        if (containerRef.current && count > 0) {
          containerRef.current.innerHTML = '';
          renderSlideToElement(presentation, 0, containerRef.current);
        }

        // Generate thumbnails for the slide strip
        try {
          const thumbs = getThumbnails(presentation, 140);
          if (!cancelled) {
            setThumbnails(thumbs);
          }
        } catch {
          // Thumbnails are optional — no error if they fail
        }

        if (!cancelled) setLoading(false);
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
      if (presentationRef.current) {
        presentationRef.current.cleanup();
        presentationRef.current = null;
      }
    };
  }, [file]);

  // Navigate to a specific slide
  const goToSlide = useCallback((index) => {
    if (!presentationRef.current || !containerRef.current) return;
    if (index < 0 || index >= slideCount) return;

    containerRef.current.innerHTML = '';
    renderSlideToElement(presentationRef.current, index, containerRef.current);
    setCurrentSlide(index);
  }, [slideCount]);

  // Keyboard navigation (scoped to this viewer)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlide, goToSlide]);

  // Auto-scroll the active thumbnail into view
  useEffect(() => {
    if (thumbStripRef.current) {
      const active = thumbStripRef.current.querySelector('.pptx-viewer__thumb--active');
      if (active) {
        active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentSlide]);

  if (loading) {
    return <div className="pdf-viewer__loading"><div className="spinner" /></div>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state__title">Failed to load presentation</div>
        <div className="empty-state__text">{error}</div>
      </div>
    );
  }

  if (slideCount === 0) {
    return (
      <div className="empty-state">
        <Presentation size={48} />
        <div className="empty-state__title">No slides found</div>
        <div className="empty-state__text">The file appears to have no slides.</div>
      </div>
    );
  }

  return (
    <div className="pptx-viewer">
      {/* Slide display — rendered by pptx-viewer library */}
      <div className="pptx-viewer__slide-wrapper">
        <div className="pptx-viewer__slide-number">
          Slide {currentSlide + 1} / {slideCount}
        </div>
        <div
          ref={containerRef}
          className="pptx-viewer__canvas"
        />
      </div>

      {/* Navigation */}
      {slideCount > 1 && (
        <div className="pptx-viewer__nav">
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide <= 0}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ opacity: currentSlide <= 0 ? 0.3 : 1 }}
          ><ChevronLeft size={18} /></motion.button>

          <div className="pptx-viewer__thumb-strip" ref={thumbStripRef}>
            {thumbnails.length > 0
              ? thumbnails.map((thumbSvg, i) => (
                  <motion.button
                    key={i}
                    className={`pptx-viewer__thumb pptx-viewer__thumb--visual ${i === currentSlide ? 'pptx-viewer__thumb--active' : ''}`}
                    onClick={() => goToSlide(i)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    ref={(el) => {
                      if (el && !el.dataset.rendered) {
                        el.innerHTML = '';
                        el.appendChild(thumbSvg.cloneNode(true));
                        el.dataset.rendered = 'true';
                      }
                    }}
                  />
                ))
              : Array.from({ length: slideCount }, (_, i) => (
                  <motion.button
                    key={i}
                    className={`pptx-viewer__thumb ${i === currentSlide ? 'pptx-viewer__thumb--active' : ''}`}
                    onClick={() => goToSlide(i)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    <span className="pptx-viewer__thumb-num">{i + 1}</span>
                  </motion.button>
                ))
            }
          </div>

          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide >= slideCount - 1}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ opacity: currentSlide >= slideCount - 1 ? 0.3 : 1 }}
          ><ChevronRight size={18} /></motion.button>
        </div>
      )}
    </div>
  );
}
