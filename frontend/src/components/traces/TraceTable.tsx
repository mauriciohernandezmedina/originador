import React from 'react';
import { InteractionStatus, TraceResponse } from '../../types/api';

export interface TraceFilters {
  iterationId?: string;
  modelName?: string;
  status?: string;
  minLatency?: number;
  maxLatency?: number;
}

interface TraceTableProps {
  traces: TraceResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
  filters: TraceFilters;
  onFilterChange: (filters: TraceFilters) => void;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  onSelectTrace: (traceId: string) => void;
  availableIterations?: string[];
}

export const TraceTable: React.FC<TraceTableProps> = ({
  traces,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  isLoading,
  filters,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onSelectTrace,
  availableIterations = [],
}) => {
  const handleInputChange = (field: keyof TraceFilters, value: string | number | undefined) => {
    onFilterChange({
      ...filters,
      [field]: value === '' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      iterationId: undefined,
      modelName: undefined,
      status: undefined,
      minLatency: undefined,
      maxLatency: undefined,
    });
  };

  const renderStatusBadge = (status: InteractionStatus | string) => {
    let bg = 'rgba(156, 163, 175, 0.15)';
    let color = 'var(--text-secondary)';
    let border = '1px solid rgba(156, 163, 175, 0.3)';

    if (status === 'SUCCESS') {
      bg = 'rgba(34, 197, 94, 0.15)';
      color = '#4ade80';
      border = '1px solid rgba(34, 197, 94, 0.3)';
    } else if (status === 'ERROR') {
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#f87171';
      border = '1px solid rgba(239, 68, 68, 0.3)';
    } else if (status === 'TIMEOUT') {
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      border = '1px solid rgba(245, 158, 11, 0.3)';
    }

    return (
      <span style={{
        padding: '0.2rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: border,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>
        {status}
      </span>
    );
  };

  const renderLatencyBadge = (latencyMs: number) => {
    let color = '#4ade80'; // Fast (< 500ms)
    if (latencyMs >= 1500) {
      color = '#f87171'; // Slow (> 1.5s)
    } else if (latencyMs >= 500) {
      color = '#fbbf24'; // Medium
    }

    return (
      <span style={{ fontWeight: 600, color }}>
        {latencyMs} ms
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'flex-end',
      }}>
        {/* Iteration Filter */}
        <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Iteración
          </label>
          <select
            value={filters.iterationId || ''}
            onChange={(e) => handleInputChange('iterationId', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.6rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            <option value="">Todas las iteraciones</option>
            {availableIterations.map((iter) => (
              <option key={iter} value={iter}>{iter}</option>
            ))}
          </select>
        </div>

        {/* Model Name Filter */}
        <div style={{ flex: '1 1 160px', minWidth: '140px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Modelo LLM
          </label>
          <input
            type="text"
            placeholder="Ej: gpt-4o, claude-3"
            value={filters.modelName || ''}
            onChange={(e) => handleInputChange('modelName', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.6rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Estado
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleInputChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.6rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            <option value="">Todos los estados</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ERROR">ERROR</option>
            <option value="TIMEOUT">TIMEOUT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Latency Range */}
        <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Latencia Mín. / Máx. (ms)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={filters.minLatency ?? ''}
              onChange={(e) => handleInputChange('minLatency', e.target.value ? Number(e.target.value) : undefined)}
              style={{
                width: '50%',
                padding: '0.5rem 0.4rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>-</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={filters.maxLatency ?? ''}
              onChange={(e) => handleInputChange('maxLatency', e.target.value ? Number(e.target.value) : undefined)}
              style={{
                width: '50%',
                padding: '0.5rem 0.4rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Reset Button */}
        <div>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Estado</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>ID de Traza</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Iteración</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Modelo</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Latencia</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Throughput</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Fecha / Hora</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Cargando trazas de interacción...
                  </td>
                </tr>
              ) : traces.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No se encontraron trazas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                traces.map((trace) => (
                  <tr
                    key={trace.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {renderStatusBadge(trace.status)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span
                        onClick={() => onSelectTrace(trace.id)}
                        style={{ cursor: 'pointer', color: 'var(--accent-blue)', textDecoration: 'underline' }}
                        title="Ver detalle completo"
                      >
                        {trace.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--accent-blue)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}>
                        {trace.iterationId}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {trace.modelName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      {renderLatencyBadge(trace.latencyMs)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {trace.tokensPerSecond.toFixed(1)} tok/s
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {new Date(trace.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => onSelectTrace(trace.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        🔍 Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          <div>
            Mostrando {traces.length} de {totalElements} trazas (Página {currentPage + 1} de {Math.max(1, totalPages)})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                style={{
                  padding: '0.3rem 0.5rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 0 || isLoading}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  cursor: (currentPage <= 0 || isLoading) ? 'not-allowed' : 'pointer',
                  opacity: (currentPage <= 0 || isLoading) ? 0.5 : 1,
                  fontSize: '0.8rem',
                }}
              >
                ◀ Anterior
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isLoading}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  cursor: (currentPage >= totalPages - 1 || isLoading) ? 'not-allowed' : 'pointer',
                  opacity: (currentPage >= totalPages - 1 || isLoading) ? 0.5 : 1,
                  fontSize: '0.8rem',
                }}
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraceTable;
