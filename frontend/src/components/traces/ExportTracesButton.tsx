import React, { useState } from 'react';
import { TraceResponse } from '../../types/api';
import { exportTracesToCsv, exportTracesToJson } from '../../utils/exportUtils';

interface ExportTracesButtonProps {
  traces: TraceResponse[];
  disabled?: boolean;
}

export const ExportTracesButton: React.FC<ExportTracesButtonProps> = ({ traces, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportJson = () => {
    exportTracesToJson(traces, `traces_${new Date().toISOString().slice(0, 10)}.json`);
    setIsOpen(false);
  };

  const handleExportCsv = () => {
    exportTracesToCsv(traces, `traces_${new Date().toISOString().slice(0, 10)}.csv`);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || traces.length === 0}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: (disabled || traces.length === 0) ? 'not-allowed' : 'pointer',
          opacity: (disabled || traces.length === 0) ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>📥 Exportar ({traces.length})</span>
        <span style={{ fontSize: '0.7rem' }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
          />
          <div style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.4rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            minWidth: '160px',
            overflow: 'hidden',
          }}>
            <button
              onClick={handleExportCsv}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              📄 Formato CSV (.csv)
            </button>
            <button
              onClick={handleExportJson}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              📊 Formato JSON (.json)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportTracesButton;
