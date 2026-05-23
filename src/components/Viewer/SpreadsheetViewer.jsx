import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';

export default function SpreadsheetViewer({ file }) {
  const [workbook, setWorkbook] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadFile = async () => {
      try {
        let arrayBuffer;
        if (file.data instanceof File || file.data instanceof Blob) {
          arrayBuffer = await file.data.arrayBuffer();
        } else if (file.url) {
          const response = await fetch(file.url);
          arrayBuffer = await response.arrayBuffer();
        }

        if (cancelled) return;

        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        if (!cancelled) {
          setWorkbook(wb);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadFile();
    return () => { cancelled = true; };
  }, [file]);

  const sheetData = useMemo(() => {
    if (!workbook) return [];
    const sheetName = workbook.SheetNames[activeSheet];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  }, [workbook, activeSheet]);

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
        <div className="empty-state__title">Failed to load spreadsheet</div>
        <div className="empty-state__text">{error}</div>
      </div>
    );
  }

  if (!workbook) return null;

  const headers = sheetData[0] || [];
  const rows = sheetData.slice(1);

  return (
    <motion.div
      className="spreadsheet-viewer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Sheet tabs */}
      {workbook.SheetNames.length > 1 && (
        <div className="spreadsheet-viewer__tabs">
          {workbook.SheetNames.map((name, idx) => (
            <motion.button
              key={name}
              className={`spreadsheet-viewer__tab ${idx === activeSheet ? 'spreadsheet-viewer__tab--active' : ''}`}
              onClick={() => setActiveSheet(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {name}
            </motion.button>
          ))}
        </div>
      )}

      {/* Table */}
      {sheetData.length > 0 ? (
        <div style={{ overflow: 'auto', maxHeight: '70vh', borderRadius: 'var(--radius-lg)' }}>
          <table className="spreadsheet-viewer__table">
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>#</th>
                {headers.map((h, i) => (
                  <th key={i}>{h || `Col ${i + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>{rowIdx + 1}</td>
                  {headers.map((_, colIdx) => (
                    <td key={colIdx}>{row[colIdx] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state__title">Empty Sheet</div>
          <div className="empty-state__text">This sheet has no data.</div>
        </div>
      )}
    </motion.div>
  );
}
