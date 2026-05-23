import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Presentation } from 'lucide-react';

// Basic PPTX viewer — extracts text content from XML slides
// Full pixel-perfect rendering requires a full PPTX engine; this shows content cleanly.
async function extractSlides(file) {
  const JSZip = (await import('jszip')).default;
  let arrayBuffer;
  if (file.data instanceof File || file.data instanceof Blob) {
    arrayBuffer = await file.data.arrayBuffer();
  } else if (file.url) {
    const res = await fetch(file.url);
    arrayBuffer = await res.arrayBuffer();
  }

  const zip = await JSZip.loadAsync(arrayBuffer);

  // Get slide files in order
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });

  const slides = await Promise.all(slideFiles.map(async (name, idx) => {
    const xmlText = await zip.file(name).async('string');
    // Extract all text runs from the slide
    const textMatches = [...xmlText.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)];
    const rawTexts = textMatches.map(m => m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'")).filter(t => t.trim());

    // Group by paragraph (a:p) to separate heading from body
    const paraMatches = [...xmlText.matchAll(/<a:p[^>]*>([\s\S]*?)<\/a:p>/g)];
    const paragraphs = paraMatches.map(m => {
      const inner = m[1];
      const texts = [...inner.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)]
        .map(t => t[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'"))
        .join('');
      return texts.trim();
    }).filter(Boolean);

    return {
      index: idx + 1,
      title: paragraphs[0] || `Slide ${idx + 1}`,
      body: paragraphs.slice(1),
    };
  }));

  return slides;
}

export default function PPTXViewer({ file }) {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    extractSlides(file)
      .then(s => { if (!cancelled) { setSlides(s); setLoading(false); }})
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); }});

    return () => { cancelled = true; };
  }, [file]);

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

  if (slides.length === 0) {
    return (
      <div className="empty-state">
        <Presentation size={48} />
        <div className="empty-state__title">No slides found</div>
        <div className="empty-state__text">The file appears to have no slides.</div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="pptx-viewer">
      {/* Slide display */}
      <motion.div
        className="pptx-viewer__slide"
        key={currentSlide}
        initial={{ opacity: 0, x: 40, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      >
        <div className="pptx-viewer__slide-number">
          Slide {slide.index} / {slides.length}
        </div>
        <div className="pptx-viewer__title">{slide.title}</div>
        {slide.body.length > 0 && (
          <ul className="pptx-viewer__body">
            {slide.body.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Navigation */}
      {slides.length > 1 && (
        <div className="pptx-viewer__nav">
          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))}
            disabled={currentSlide <= 0}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ opacity: currentSlide <= 0 ? 0.3 : 1 }}
          ><ChevronLeft size={18} /></motion.button>

          <div className="pptx-viewer__thumb-strip">
            {slides.map((s, i) => (
              <motion.button
                key={i}
                className={`pptx-viewer__thumb ${i === currentSlide ? 'pptx-viewer__thumb--active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                <span className="pptx-viewer__thumb-num">{i + 1}</span>
                <span className="pptx-viewer__thumb-title">{s.title}</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={() => setCurrentSlide(s => Math.min(s + 1, slides.length - 1))}
            disabled={currentSlide >= slides.length - 1}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ opacity: currentSlide >= slides.length - 1 ? 0.3 : 1 }}
          ><ChevronRight size={18} /></motion.button>
        </div>
      )}
    </div>
  );
}
