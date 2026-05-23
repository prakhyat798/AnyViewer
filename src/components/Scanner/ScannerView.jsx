import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  SwitchCamera,
  ImageIcon,
  X,
  Download,
  RotateCw,
  Trash2,
  FileDown,
  CheckCircle,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { AppContext, ToastContext } from '../../App';
import jsPDF from 'jspdf';

export default function ScannerView() {
  const { navigate, scannerScans, setScannerScans } = useContext(AppContext);
  const { addToast } = useContext(ToastContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('original');
  const [showGallery, setShowGallery] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Camera Error',
        message: 'Could not access camera. Make sure permissions are granted.',
      });
    }
  }, [facingMode, addToast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  // Switch camera
  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, [stopCamera]);

  // Restart camera when facingMode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  // Import image from gallery
  const importFromGallery = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target.result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [stopCamera]);

  // Apply filter to captured image
  const getFilteredStyle = (filter) => {
    switch (filter) {
      case 'grayscale': return { filter: 'grayscale(100%) contrast(1.2)' };
      case 'highcontrast': return { filter: 'contrast(1.8) brightness(1.1)' };
      case 'bw': return { filter: 'grayscale(100%) contrast(2) brightness(1.2)' };
      default: return {};
    }
  };

  // Save scan
  const saveScan = useCallback(() => {
    if (!capturedImage) return;
    const newScan = {
      id: Date.now(),
      image: capturedImage,
      filter: activeFilter,
      timestamp: new Date().toISOString(),
    };
    setScannerScans(prev => [...prev, newScan]);
    addToast({ type: 'success', title: 'Scan Saved', message: `Page ${scannerScans.length + 1} added` });
    setCapturedImage(null);
    startCamera();
  }, [capturedImage, activeFilter, scannerScans.length, setScannerScans, addToast, startCamera]);

  // Export as PDF
  const exportAsPDF = useCallback(() => {
    if (scannerScans.length === 0) {
      addToast({ type: 'warning', title: 'No Scans', message: 'Capture some pages first.' });
      return;
    }

    const pdf = new jsPDF();
    scannerScans.forEach((scan, index) => {
      if (index > 0) pdf.addPage();
      const imgWidth = 190;
      const imgHeight = 260;
      pdf.addImage(scan.image, 'JPEG', 10, 10, imgWidth, imgHeight);
    });

    pdf.save(`AnyViewer_Scan_${Date.now()}.pdf`);
    addToast({ type: 'success', title: 'PDF Exported', message: `${scannerScans.length} pages saved.` });
  }, [scannerScans, addToast]);

  // Retake
  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Delete scan from gallery
  const deleteScan = useCallback((id) => {
    setScannerScans(prev => prev.filter(s => s.id !== id));
    addToast({ type: 'info', title: 'Scan Deleted', message: 'Page removed.' });
  }, [setScannerScans, addToast]);

  // Gallery view
  if (showGallery) {
    return (
      <motion.div
        className="scanner"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="scanner__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              className="btn btn--ghost btn--icon btn--sm"
              onClick={() => setShowGallery(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h2 className="scanner__title">Scan Gallery ({scannerScans.length} pages)</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {scannerScans.length > 0 && (
              <motion.button
                className="btn btn--primary btn--sm"
                onClick={exportAsPDF}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileDown size={16} />
                Export PDF
              </motion.button>
            )}
          </div>
        </div>

        <div className="scan-gallery" style={{ flex: 1, overflow: 'auto' }}>
          {scannerScans.length === 0 ? (
            <div className="empty-state">
              <Layers size={48} />
              <div className="empty-state__title">No Scans Yet</div>
              <div className="empty-state__text">
                Use the scanner to capture document pages.
              </div>
            </div>
          ) : (
            <motion.div
              className="scan-gallery__grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {scannerScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  className="scan-gallery__item"
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ position: 'relative' }}
                >
                  <img
                    src={scan.image}
                    alt={`Scan ${index + 1}`}
                    style={getFilteredStyle(scan.filter)}
                  />
                  <div className="scan-gallery__item-number">{index + 1}</div>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); deleteScan(scan.id); }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // Preview captured image
  if (capturedImage) {
    return (
      <motion.div
        className="scan-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="scanner__header">
          <h2 className="scanner__title">Preview</h2>
          <motion.button
            className="btn btn--ghost btn--sm"
            onClick={() => setShowGallery(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Layers size={16} />
            Gallery ({scannerScans.length})
          </motion.button>
        </div>

        <div className="scan-preview__image-area">
          <motion.img
            src={capturedImage}
            alt="Captured scan"
            className="scan-preview__image"
            style={getFilteredStyle(activeFilter)}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        </div>

        {/* Filters */}
        <div className="scan-preview__filters">
          {[
            { id: 'original', label: 'Original' },
            { id: 'grayscale', label: 'Grayscale' },
            { id: 'highcontrast', label: 'High Contrast' },
            { id: 'bw', label: 'Black & White' },
          ].map((filter) => (
            <motion.button
              key={filter.id}
              className={`scan-preview__filter ${activeFilter === filter.id ? 'scan-preview__filter--active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="scan-preview__filter-thumb">
                <img
                  src={capturedImage}
                  alt={filter.label}
                  style={getFilteredStyle(filter.id)}
                />
              </div>
              <span className="scan-preview__filter-label">{filter.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="scan-preview__actions">
          <motion.button
            className="btn btn--secondary"
            onClick={retake}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCw size={16} />
            Retake
          </motion.button>
          <motion.button
            className="btn btn--primary"
            onClick={saveScan}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle size={16} />
            Save Scan
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Camera view
  return (
    <motion.div
      className="scanner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="scanner__header">
        <h2 className="scanner__title">Document Scanner</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {scannerScans.length > 0 && (
            <motion.button
              className="btn btn--secondary btn--sm"
              onClick={() => setShowGallery(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Layers size={16} />
              Gallery ({scannerScans.length})
            </motion.button>
          )}
        </div>
      </div>

      <div className="scanner__viewfinder">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="scanner__video"
            />
            <div className="scanner__overlay">
              <div className="scanner__frame">
                <div className="scanner__frame-corner scanner__frame-corner--tl" />
                <div className="scanner__frame-corner scanner__frame-corner--tr" />
                <div className="scanner__frame-corner scanner__frame-corner--bl" />
                <div className="scanner__frame-corner scanner__frame-corner--br" />
                <div className="scanner__scan-line" />
              </div>
            </div>
          </>
        ) : (
          <motion.div
            className="empty-state"
            style={{ color: 'white' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Camera size={64} style={{ opacity: 0.5 }} />
            <div className="empty-state__title" style={{ color: 'white' }}>
              Ready to Scan
            </div>
            <div className="empty-state__text" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Tap the button below to start the camera, or import an image from your gallery.
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <motion.button
                className="btn btn--primary"
                onClick={startCamera}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Camera size={18} />
                Start Camera
              </motion.button>
              <motion.button
                className="btn btn--secondary"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ImageIcon size={18} />
                Import Image
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Camera controls */}
      {cameraActive && (
        <motion.div
          className="scanner__controls"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.2 }}
        >
          <motion.button
            className="scanner__side-btn"
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Import Image"
          >
            <ImageIcon size={20} />
          </motion.button>

          <motion.button
            className="scanner__capture-btn"
            onClick={captureImage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            title="Capture"
          >
            <Camera size={28} />
          </motion.button>

          <motion.button
            className="scanner__side-btn"
            onClick={switchCamera}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Switch Camera"
          >
            <SwitchCamera size={20} />
          </motion.button>
        </motion.div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={importFromGallery}
        style={{ display: 'none' }}
      />
    </motion.div>
  );
}
