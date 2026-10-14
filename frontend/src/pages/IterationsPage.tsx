import React, { useState, useEffect, useCallback } from 'react';
import iterationService from '../services/iterationService';
import { IterationSummary, IterationComparisonDto } from '../types/api';
import IterationSelector from '../components/iterations/IterationSelector';
import IterationComparisonView from '../components/iterations/IterationComparisonView';
import IterationMetadataModal from '../components/iterations/IterationMetadataModal';

export const IterationsPage: React.FC = () => {
  const [iterations, setIterations] = useState<IterationSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Comparison State
  const [baseId, setBaseId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<IterationComparisonDto | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  // Modal Editing State
  const [editingIteration, setEditingIteration] = useState<IterationSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchIterations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await iterationService.listIterations();
      setIterations(data);

      // Pre-select if we have at least 2 iterations and no selection yet
      if (data.length >= 2 && !baseId && !targetId) {
        setBaseId(data[0].id);
        setTargetId(data[1].id);
      }
    } catch (err: unknown) {
      setError('Error al obtener la lista de iteraciones.');
    } finally {
      setIsLoading(false);
    }
  }, [baseId, targetId]);

  useEffect(() => {
    fetchIterations();

    const handleDataUpdated = () => fetchIterations();
    window.addEventListener('originador:data-updated', handleDataUpdated);
    return () => window.removeEventListener('originador:data-updated', handleDataUpdated);
  }, [fetchIterations]);

  const handleCompare = async () => {
    if (!baseId || !targetId || baseId === targetId) return;

    try {
      setIsComparing(true);
      setError(null);
      const res = await iterationService.compareIterations(baseId, targetId);
      setComparisonData(res);
    } catch (err: unknown) {
      setError('Error al calcular la comparativa de iteraciones.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleEditClick = (iter: IterationSummary) => {
    setEditingIteration(iter);
    setIsModalOpen(true);
  };

  const handleSaveMetadata = async (id: string, name: string, description: string) => {
    await iterationService.updateIteration(id, { name, description });
    await fetchIterations();
    // If the edited iteration was in the active comparison, re-run comparison
    if (comparisonData && (baseId === id || targetId === id)) {
      handleCompare();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Gestión & Comparación de Iteraciones
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Evalúe optimizaciones de prompts, modelos y herramientas midiendo deltas exactos de latencia, tokens y velocidad.
          </p>
        </div>

        <button
          onClick={fetchIterations}
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

      {/* Comparison Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          ⚡ Comparador de Rendimiento Frente a Frente
        </h3>

        <IterationSelector
          iterations={iterations}
          baseId={baseId}
          targetId={targetId}
          onBaseChange={setBaseId}
          onTargetChange={setTargetId}
          onCompare={handleCompare}
          isLoading={isComparing}
        />

        <IterationComparisonView data={comparisonData} isLoading={isComparing} />
      </section>

      {/* Iterations Catalog Table */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          📚 Catálogo de Versiones Registradas ({iterations.length})
        </h3>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Identificador / Nombre</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Descripción</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Llamadas</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Latencia Media</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Throughput</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Tasa Éxito</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {iterations.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {isLoading ? 'Cargando iteraciones...' : 'No se han registrado iteraciones aún. Envíe trazas o pulse "Cargar Datos Demo".'}
                    </td>
                  </tr>
                ) : (
                  iterations.map((iter) => {
                    const isBase = baseId === iter.id;
                    const isTarget = targetId === iter.id;

                    return (
                      <tr
                        key={iter.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: isBase
                            ? 'rgba(59, 130, 246, 0.05)'
                            : isTarget
                            ? 'rgba(168, 85, 247, 0.05)'
                            : 'transparent',
                        }}
                      >
                        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {iter.name}
                            {isBase && (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--accent-blue)', color: '#fff' }}>
                                BASE
                              </span>
                            )}
                            {isTarget && (
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--accent-purple)', color: '#fff' }}>
                                CANDIDATA
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                            {iter.id}
                          </div>
                        </td>

                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', verticalAlign: 'top', maxWidth: '300px' }}>
                          {iter.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Sin descripción</span>}
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', verticalAlign: 'top' }}>
                          {iter.totalInteractions.toLocaleString()}
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-primary)', verticalAlign: 'top' }}>
                          {iter.avgLatencyMs.toFixed(1)} ms
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-primary)', verticalAlign: 'top' }}>
                          {iter.avgTokensPerSecond.toFixed(1)} tok/s
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right', verticalAlign: 'top' }}>
                          <span style={{
                            fontWeight: 600,
                            color: iter.successRate >= 95 ? '#4ade80' : iter.successRate >= 80 ? '#fbbf24' : '#f87171',
                          }}>
                            {iter.successRate.toFixed(1)}%
                          </span>
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'top' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button
                              onClick={() => handleEditClick(iter)}
                              title="Editar metadatos"
                              style={{
                                padding: '0.35rem 0.6rem',
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => setBaseId(iter.id)}
                              disabled={isBase}
                              title="Usar como base de comparación"
                              style={{
                                padding: '0.35rem 0.6rem',
                                backgroundColor: isBase ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                color: isBase ? '#60a5fa' : 'var(--text-primary)',
                                fontSize: '0.75rem',
                                cursor: isBase ? 'default' : 'pointer',
                              }}
                            >
                              Base
                            </button>
                            <button
                              onClick={() => setTargetId(iter.id)}
                              disabled={isTarget}
                              title="Usar como candidata a comparar"
                              style={{
                                padding: '0.35rem 0.6rem',
                                backgroundColor: isTarget ? 'rgba(168, 85, 247, 0.2)' : 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                color: isTarget ? '#c084fc' : 'var(--text-primary)',
                                fontSize: '0.75rem',
                                cursor: isTarget ? 'default' : 'pointer',
                              }}
                            >
                              Candidata
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Metadata Modal */}
      <IterationMetadataModal
        iteration={editingIteration}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIteration(null);
        }}
        onSave={handleSaveMetadata}
      />
    </div>
  );
};

export default IterationsPage;
