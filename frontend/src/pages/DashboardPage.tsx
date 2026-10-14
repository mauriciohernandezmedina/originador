import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { PerformanceSummaryDto } from '../types/api';
import KpiCard from '../components/common/KpiCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import LatencyTimelineChart from '../components/charts/LatencyTimelineChart';
import TokenDistributionChart from '../components/charts/TokenDistributionChart';
import ToolBreakdownChart from '../components/charts/ToolBreakdownChart';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<PerformanceSummaryDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<PerformanceSummaryDto>(`/metrics/summary?timeRange=${timeRange}`);
      setSummary(res.data);
    } catch (err: unknown) {
      console.error('Error fetching metrics summary:', err);
      setError('No se pudieron obtener las métricas de rendimiento. Verifique la conexión con el backend.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSummary();

    const handleDataUpdated = () => fetchSummary();
    window.addEventListener('originador:data-updated', handleDataUpdated);
    return () => window.removeEventListener('originador:data-updated', handleDataUpdated);
  }, [fetchSummary]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Bar: Title & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Tablero Principal de Rendimiento
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Métricas agregadas en tiempo real de interacciones, latencia, consumo de tokens y llamadas a herramientas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filtro temporal:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todo el historial</option>
            <option value="1h">Última 1 hora</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
          <button
            onClick={fetchSummary}
            title="Refrescar"
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              padding: '0.4rem 0.6rem',
              cursor: 'pointer',
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--accent-red)',
          borderRadius: '8px',
          color: '#f87171',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{error}</span>
          <button
            onClick={fetchSummary}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: 'var(--accent-red)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !summary && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
            <LoadingSkeleton height="110px" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
            <LoadingSkeleton height="320px" />
            <LoadingSkeleton height="320px" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && summary && summary.totalInteractions === 0 && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📊</span>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aún no hay métricas registradas</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Para comenzar a visualizar el análisis de rendimiento, envíe datos a través de la API REST o presione el botón superior para cargar datos de muestra.
          </p>
        </div>
      )}

      {/* Populated Data Dashboard */}
      {summary && summary.totalInteractions > 0 && (
        <>
          {/* KPI Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            <KpiCard
              title="Latencia Media"
              value={`${summary.latencyMetrics.avgMs} ms`}
              subtitle={`Mín: ${summary.latencyMetrics.minMs} ms | Máx: ${summary.latencyMetrics.maxMs} ms`}
              badge={`p95: ${summary.latencyMetrics.p95Ms} ms`}
              icon="⏱️"
              color="var(--accent-blue)"
            />
            <KpiCard
              title="Throughput Medio"
              value={`${summary.tokenMetrics.avgTokensPerSecond}`}
              subtitle="Tokens generados por segundo"
              badge="Velocidad"
              icon="🚀"
              color="var(--accent-purple)"
            />
            <KpiCard
              title="Total Interacciones"
              value={summary.totalInteractions.toLocaleString()}
              subtitle={`${summary.successCount} exitosas / ${summary.errorCount} fallidas`}
              icon="💬"
              color="var(--accent-green)"
            />
            <KpiCard
              title="Tasa de Error"
              value={`${summary.errorRatePercentage}%`}
              subtitle={summary.errorCount === 0 ? 'Cero fallos detectados' : `${summary.errorCount} ejecuciones con error`}
              icon="⚠️"
              color={summary.errorRatePercentage > 5 ? 'var(--accent-red)' : 'var(--accent-blue)'}
            />
          </div>

          {/* Charts Row 1: Latency & Tokens */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '1.5rem',
          }}>
            <LatencyTimelineChart metrics={summary.latencyMetrics} />
            <TokenDistributionChart metrics={summary.tokenMetrics} />
          </div>

          {/* Charts Row 2: Tool Breakdown */}
          <div>
            <ToolBreakdownChart toolUsage={summary.toolUsage} />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
