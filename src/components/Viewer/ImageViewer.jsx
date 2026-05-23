import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, RotateCcw } from 'lucide-react';

export default function ImageViewer({ file, zoom = 100, rotation = 0 }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(null);
  const [localZoom, setLocalZoom] = useState(zoom);
  const [localRotation, setLocalRotation] = useState(rotation);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragStart.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
  }, [pan]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !dragStart.current) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.current.x,
      y: touch.clientY - dragStart.current.y,
    });
  }, [isDragging]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setLocalZoom(z => Math.min(Math.max(z - e.deltaY * 0.1, 25), 400));
  }, []);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setLocalZoom(100);
    setLocalRotation(0);
  }, []);

  return (
    <div
      className="image-viewer"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onWheel={handleWheel}
      style={{ overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div
        className="image-viewer__container"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${localZoom / 100}) rotate(${localRotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.2s var(--ease-bounce)',
          userSelect: 'none',
        }}
      >
        <img
          src={file.url}
          alt={file.name}
          className="image-viewer__img"
          draggable={false}
        />
      </div>

      {/* Floating controls */}
      <div className="image-viewer__controls">
        <motion.button
          className="btn btn--ghost btn--icon btn--sm"
          title="Zoom out"
          onClick={() => setLocalZoom(z => Math.max(z - 25, 25))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        ><ZoomOut size={16} /></motion.button>

        <span className="viewer__page-info" style={{ minWidth: 48, textAlign: 'center' }}>
          {Math.round(localZoom)}%
        </span>

        <motion.button
          className="btn btn--ghost btn--icon btn--sm"
          title="Zoom in"
          onClick={() => setLocalZoom(z => Math.min(z + 25, 400))}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        ><ZoomIn size={16} /></motion.button>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <motion.button
          className="btn btn--ghost btn--icon btn--sm"
          title="Rotate left"
          onClick={() => setLocalRotation(r => (r - 90 + 360) % 360)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        ><RotateCcw size={16} /></motion.button>

        <motion.button
          className="btn btn--ghost btn--icon btn--sm"
          title="Rotate right"
          onClick={() => setLocalRotation(r => (r + 90) % 360)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        ><RotateCw size={16} /></motion.button>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <motion.button
          className="btn btn--ghost btn--icon btn--sm"
          title="Reset view"
          onClick={resetView}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        ><Maximize2 size={16} /></motion.button>
      </div>
    </div>
  );
}
