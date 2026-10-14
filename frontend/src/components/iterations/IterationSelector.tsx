import React from 'react';
import { IterationSummary } from '../../types/api';

interface IterationSelectorProps {
  iterations: IterationSummary[];
  baseId: string;
  targetId: string;
  onBaseChange: (id: string) => void;
  onTargetChange: (id: string) => void;
  onCompare: () => void;
  isLoading?: boolean;
}

export const IterationSelector: React.FC<IterationSelectorProps> = ({
  iterations,
  baseId,
  targetId,
  onBaseChange,
  onTargetChange,
  onCompare,
  isLoading,
}) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Iteración Base (Referencia)
          </label>
          <select
            value={baseId}
            onChange={(e) => onBaseChange(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              minWidth: '220px',
            }}
          >
            <option value="">Seleccione base...</option>
            {iterations.map((iter) => (
              <option key={iter.id} value={iter.id}>
                {iter.name} ({iter.totalInteractions} llamadas)
              </option>
            ))}
          </select>
        </div>

        <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold', alignSelf: 'center', marginTop: '1rem' }}>
          VS
        </span>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Iteración Candidata (Optimización)
          </label>
          <select
            value={targetId}
            onChange={(e) => onTargetChange(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              minWidth: '220px',
            }}
          >
            <option value="">Seleccione candidata...</option>
            {iterations.map((iter) => (
              <option key={iter.id} value={iter.id}>
                {iter.name} ({iter.totalInteractions} llamadas)
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onCompare}
        disabled={!baseId || !targetId || baseId === targetId || isLoading}
        style={{
          padding: '0.65rem 1.25rem',
          backgroundColor: 'var(--accent-purple)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: (!baseId || !targetId || baseId === targetId || isLoading) ? 'not-allowed' : 'pointer',
          opacity: (!baseId || !targetId || baseId === targetId || isLoading) ? 0.5 : 1,
          alignSelf: 'flex-end',
          marginTop: '0.5rem',
        }}
      >
        {isLoading ? 'Calculando...' : '⚡ Comparar Rendimiento'}
      </button>
    </div>
  );
};

export default IterationSelector;
