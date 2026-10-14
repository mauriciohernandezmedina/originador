import React, { useState, useEffect } from 'react';
import traceService from '../../services/traceService';
import { ToolInvocationDetailDto, TraceDetailResponse } from '../../types/api';

interface TraceDetailModalProps {
  traceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TraceDetailModal: React.FC<TraceDetailModalProps> = ({ traceId, isOpen, onClose }) => {
  const [trace, setTrace] = useState<TraceDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !traceId) {
      setTrace(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await traceService.getTraceById(traceId);
        setTrace(data);
      } catch (err: unknown) {
        setError('Error al cargar los detalles de la traza.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, traceId]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'prompt' | 'response') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const toggleToolExpanded = (toolId: string) => {
    setExpandedTools((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
  };

  // Waterfall calculation helpers
  const totalDurationMs = trace ? Math.max(1, trace.latencyMs) : 1;
  const traceStartMs = trace ? new Date(trace.startedAt).getTime() : 0;

  const getToolOffsetPercentage = (tool: ToolInvocationDetailDto) => {
    const toolStartMs = new Date(tool.startedAt).getTime();
    const offsetMs = Math.max(0, toolStartMs - traceStartMs);
    return Math.min(100, Math.max(0, (offsetMs / totalDurationMs) * 100));
  };

  const getToolDurationPercentage = (tool: ToolInvocationDetailDto) => {
    const durMs = Math.max(1, tool.durationMs);
    return Math.min(100, Math.max(1, (durMs / totalDurationMs) * 100));
  };

  const totalToolsDurationMs = trace?.tools.reduce((sum, t) => sum + t.durationMs, 0) || 0;
  const netInferenceMs = Math.max(0, totalDurationMs - totalToolsDurationMs);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Detalle de Interacción LLM
              </h3>
              {trace && (
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: trace.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: trace.status === 'SUCCESS' ? '#4ade80' : '#f87171',
                  border: `1px solid ${trace.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                }}>
                  {trace.status}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
              ID: {traceId}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {isLoading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Cargando traza y desglose de herramientas...
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-red)',
              borderRadius: '8px',
              color: '#f87171',
            }}>
              {error}
            </div>
          )}

          {trace && (
            <>
              {/* Error Message banner if failed */}
              {trace.errorMessage && (
                <div style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid var(--accent-red)',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.875rem',
                }}>
                  <strong>⚠️ Error en la llamada:</strong> {trace.errorMessage}
                </div>
              )}

              {/* KPI Metadata Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-primary)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Iteración</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{trace.iterationId}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Modelo</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{trace.modelName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Latencia Total</span>
                  <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.9rem' }}>{trace.latencyMs} ms</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tokens In / Out</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {trace.inputTokens} / {trace.outputTokens}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tokens Totales</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-purple)', fontSize: '0.9rem' }}>{trace.totalTokens}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Throughput</span>
                  <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.9rem' }}>
                    {trace.tokensPerSecond.toFixed(1)} tok/s
                  </div>
                </div>
              </div>

              {/* Waterfall Execution Timeline */}
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    ⏱️ Línea de Tiempo en Cascada (Execution Waterfall)
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-blue)', borderRadius: '2px' }} />
                      Inferencia Pura ({netInferenceMs} ms)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '10px', height: '10px', backgroundColor: '#fbbf24', borderRadius: '2px' }} />
                      Herramientas ({totalToolsDurationMs} ms)
                    </span>
                  </div>
                </div>

                {/* Main LLM Inference Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>LLM Request Total</span>
                    <span style={{ color: 'var(--text-secondary)' }}>0 ms - {trace.latencyMs} ms ({trace.latencyMs} ms)</span>
                  </div>
                  <div style={{ height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--accent-blue)', borderRadius: '4px' }} />
                  </div>
                </div>

                {/* Tool Invocations Bars */}
                {trace.tools.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Invocaciones de Herramientas ({trace.tools.length})
                    </span>

                    {trace.tools.map((tool) => {
                      const offsetPct = getToolOffsetPercentage(tool);
                      const durPct = getToolDurationPercentage(tool);
                      const isExpanded = !!expandedTools[tool.id];

                      return (
                        <div key={tool.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span
                              onClick={() => toggleToolExpanded(tool.id)}
                              style={{
                                cursor: 'pointer',
                                color: '#fbbf24',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <span>{isExpanded ? '▼' : '▶'}</span>
                              <span>🔧 {tool.toolName}</span>
                              <span style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                backgroundColor: tool.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: tool.status === 'SUCCESS' ? '#4ade80' : '#f87171',
                              }}>
                                {tool.status}
                              </span>
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {tool.durationMs} ms
                            </span>
                          </div>

                          {/* Waterfall bar relative to total trace duration */}
                          <div style={{
                            height: '14px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px',
                            position: 'relative',
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              position: 'absolute',
                              left: `${offsetPct}%`,
                              width: `${Math.max(1, durPct)}%`,
                              height: '100%',
                              backgroundColor: tool.status === 'SUCCESS' ? '#fbbf24' : '#f87171',
                              borderRadius: '3px',
                            }} />
                          </div>

                          {/* Expandable tool arguments & outputs */}
                          {isExpanded && (
                            <div style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              fontSize: '0.8rem',
                              marginTop: '0.25rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem',
                            }}>
                              {tool.inputArguments && (
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                                    Argumentos de Entrada:
                                  </span>
                                  <pre style={{ margin: 0, padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflowX: 'auto', fontFamily: 'monospace' }}>
                                    {tool.inputArguments}
                                  </pre>
                                </div>
                              )}
                              {tool.outputResult && (
                                <div>
                                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                                    Resultado / Respuesta:
                                  </span>
                                  <pre style={{ margin: 0, padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflowX: 'auto', fontFamily: 'monospace' }}>
                                    {tool.outputResult}
                                  </pre>
                                </div>
                              )}
                              {tool.errorMessage && (
                                <div style={{ color: '#f87171' }}>
                                  <strong>Error de herramienta:</strong> {tool.errorMessage}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Esta interacción fue puramente inferencia (sin llamadas a herramientas/plugins externos).
                  </div>
                )}
              </div>

              {/* Prompt Text Box */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Prompt Enviado al LLM
                  </label>
                  <button
                    onClick={() => copyToClipboard(trace.promptText, 'prompt')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedPrompt ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}>
                  {trace.promptText}
                </div>
              </div>

              {/* Response Text Box */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Respuesta Generada por el LLM
                  </label>
                  <button
                    onClick={() => copyToClipboard(trace.responseText || '', 'response')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    {copiedResponse ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}>
                  {trace.responseText || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Sin respuesta registrada</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraceDetailModal;
