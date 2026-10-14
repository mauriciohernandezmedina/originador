import React, { useState, useEffect, useCallback } from 'react';
import traceService from '../services/traceService';
import iterationService from '../services/iterationService';
import { TraceResponse } from '../types/api';
import TraceTable, { TraceFilters } from '../components/traces/TraceTable';
import TraceDetailModal from '../components/traces/TraceDetailModal';
import ExportTracesButton from '../components/traces/ExportTracesButton';

export const TracesPage: React.FC = () => {
  const [traces, setTraces] = useState<TraceResponse[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [availableIterations, setAvailableIterations] = useState<string[]>([]);
  const [filters, setFilters] = useState<TraceFilters>({});

  // Modal State
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load iteration list for filter dropdown
  useEffect(() => {
    const loadIterations = async () => {
      try {
        const iterList = await iterationService.listIterations();
        setAvailableIterations(iterList.map((i) => i.id));
      } catch {
        // Fallback silently if iterations cannot be loaded yet
      }
    };
    loadIterations();
  }, []);

  // Fetch paginated traces
  const fetchTraces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await traceService.listTraces({
        iterationId: filters.iterationId,
        modelName: filters.modelName,
        status: filters.status,
        minLatency: filters.minLatency,
        maxLatency: filters.maxLatency,
        page: currentPage,
        size: pageSize,
      });

      setTraces(res.content);
      setTotalElements(res.totalElements);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      setError('Error al consultar las trazas de interacción.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    fetchTraces();

    const handleDataUpdated = () => fetchTraces();
    window.addEventListener('originador:data-updated', handleDataUpdated);
    return () => window.removeEventListener('originador:data-updated', handleDataUpdated);
  }, [fetchTraces]);

  const handleFilterChange = (newFilters: TraceFilters) => {
    setFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filtering
  };

  const handleSelectTrace = (traceId: string) => {
    setSelectedTraceId(traceId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedTraceId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Explorador Detallado de Trazas
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Auditoría profunda de prompts, respuestas, tokens consumidos y desglose en cascada (waterfall) de herramientas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchTraces}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🔄 Actualizar
          </button>

          <ExportTracesButton traces={traces} disabled={isLoading} />
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid var(--accent-red)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {/* Traces Table Component */}
      <TraceTable
        traces={traces}
        totalElements={totalElements}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(0);
        }}
        onSelectTrace={handleSelectTrace}
        availableIterations={availableIterations}
      />

      {/* Trace Detail Modal Component */}
      <TraceDetailModal
        traceId={selectedTraceId}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default TracesPage;
