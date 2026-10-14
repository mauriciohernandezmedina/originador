import React from 'react';
import { IterationComparisonDto } from '../../types/api';

interface IterationComparisonViewProps {
  data: IterationComparisonDto | null;
  isLoading?: boolean;
}

export const IterationComparisonView: React.FC<IterationComparisonViewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
        <div>Calculando diferencias y deltas de rendimiento...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { baseIteration, targetIteration, deltas } = data;

  // Helper for formatting delta badges
  const renderDeltaBadge = (
    value: number,
    type: 'lower-is-better' | 'higher-is-better',
    unit: string = '%',
    precision: number = 1
  ) => {
    const isZero = Math.abs(value) < 0.001;
    if (isZero) {
      return (
        <span style={{
          padding: '0.25rem 0.6rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: 'rgba(156, 163, 175, 0.15)',
          color: 'var(--text-secondary)',
        }}>
          0.0{unit} (Sin cambio)
        </span>
      );
    }

    const isGood = type === 'lower-is-better' ? value < 0 : value > 0;
    const sign = value > 0 ? '+' : '';
    const formatted = `${sign}${value.toFixed(precision)}${unit}`;

    const bg = isGood ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    const color = isGood ? '#4ade80' : '#f87171';
    const border = isGood ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)';

    return (
      <span style={{
        padding: '0.25rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: border,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
      }}>
        {isGood ? '▼' : '▲'} {formatted}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
      {/* Delta Executive Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        {/* Latency Delta */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Variación de Latencia
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {deltas.latencyDeltaPercentage > 0 ? '+' : ''}{deltas.latencyDeltaPercentage.toFixed(1)}%
            </span>
            {renderDeltaBadge(deltas.latencyDeltaPercentage, 'lower-is-better')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {deltas.latencyDeltaPercentage < 0 ? '⚡ Optimización de tiempo de respuesta' : '⏱️ Incremento en tiempo de inferencia'}
          </span>
        </div>

        {/* Tokens Delta */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Variación de Tokens Totales
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {deltas.tokensDeltaPercentage > 0 ? '+' : ''}{deltas.tokensDeltaPercentage.toFixed(1)}%
            </span>
            {renderDeltaBadge(deltas.tokensDeltaPercentage, 'lower-is-better')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {deltas.tokensDeltaPercentage < 0 ? '🪙 Ahorro de consumo de tokens' : '📈 Mayor consumo de contexto/salida'}
          </span>
        </div>

        {/* Speedup Throughput */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Speedup / Throughput
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {deltas.speedupPercentage > 0 ? '+' : ''}{deltas.speedupPercentage.toFixed(1)}%
            </span>
            {renderDeltaBadge(deltas.speedupPercentage, 'higher-is-better')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {deltas.speedupPercentage > 0 ? '🚀 Mayor velocidad tokens/segundo' : '📉 Disminución de velocidad de generación'}
          </span>
        </div>

        {/* Error Rate Delta */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Diferencial Tasa de Error
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {deltas.errorRateDelta > 0 ? '+' : ''}{deltas.errorRateDelta.toFixed(1)}%
            </span>
            {renderDeltaBadge(deltas.errorRateDelta, 'lower-is-better')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {deltas.errorRateDelta <= 0 ? '🛡️ Estabilidad conservada o mejorada' : '⚠️ Aumento en la tasa de fallos'}
          </span>
        </div>
      </div>

      {/* Side-by-Side Detailed Breakdown Table */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Comparativa Detallada Frente a Frente
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 600 }}>Métrica Clave</th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 600 }}>
                  <div style={{ color: 'var(--text-primary)' }}>{baseIteration.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    [Base] {baseIteration.iterationId}
                  </div>
                </th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 600 }}>
                  <div style={{ color: 'var(--accent-purple)' }}>{targetIteration.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    [Candidata] {targetIteration.iterationId}
                  </div>
                </th>
                <th style={{ padding: '0.85rem 1.5rem', fontWeight: 600 }}>Delta Relativo</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Latencia Promedio
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {baseIteration.avgLatencyMs.toFixed(1)} ms
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {targetIteration.avgLatencyMs.toFixed(1)} ms
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {renderDeltaBadge(deltas.latencyDeltaPercentage, 'lower-is-better')}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Tokens Promedio por Llamada
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {baseIteration.avgTotalTokens.toFixed(1)} tokens
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {targetIteration.avgTotalTokens.toFixed(1)} tokens
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {renderDeltaBadge(deltas.tokensDeltaPercentage, 'lower-is-better')}
                </td>
              </tr>

              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Throughput Generación
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {baseIteration.avgTokensPerSecond.toFixed(1)} tok/s
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {targetIteration.avgTokensPerSecond.toFixed(1)} tok/s
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {renderDeltaBadge(deltas.speedupPercentage, 'higher-is-better')}
                </td>
              </tr>

              <tr>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Tasa de Fallos / Errores
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                  {baseIteration.errorRatePercentage.toFixed(1)}%
                </td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {targetIteration.errorRatePercentage.toFixed(1)}%
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  {renderDeltaBadge(deltas.errorRateDelta, 'lower-is-better', '%')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IterationComparisonView;
