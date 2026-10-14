import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LatencyMetrics, TimeSeriesPointDto } from '../../types/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LatencyTimelineChartProps {
  metrics: LatencyMetrics;
  timeSeries?: TimeSeriesPointDto[];
  onOutlierClick?: (minLatency: number) => void;
}

export const LatencyTimelineChart: React.FC<LatencyTimelineChartProps> = ({
  metrics,
  timeSeries,
  onOutlierClick,
}) => {
  const hasTimeSeries = timeSeries && timeSeries.length > 0;

  const labels = hasTimeSeries
    ? timeSeries.map((t, idx) => {
        const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `#${idx + 1} ${timeStr}`;
      })
    : ['Min', 'Media', 'p50 (Mediana)', 'p90', 'p95', 'Max'];

  const dataValues = hasTimeSeries
    ? timeSeries.map((t) => t.latencyMs)
    : [metrics.minMs, metrics.avgMs, metrics.p50Ms, metrics.p90Ms, metrics.p95Ms, metrics.maxMs];

  const pointColors = hasTimeSeries
    ? timeSeries.map((t) => (t.latencyMs >= metrics.p95Ms && metrics.p95Ms > 0 ? '#ef4444' : '#38bdf8'))
    : ['#38bdf8'];

  const pointRadii = hasTimeSeries
    ? timeSeries.map((t) => (t.latencyMs >= metrics.p95Ms && metrics.p95Ms > 0 ? 6 : 4))
    : [4];

  const data = {
    labels,
    datasets: [
      {
        label: 'Latencia (ms)',
        data: dataValues,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: pointRadii,
        pointHoverRadius: 7,
      },
      {
        label: `Umbral p95 (${metrics.p95Ms} ms)`,
        data: labels.map(() => metrics.p95Ms),
        borderColor: 'rgba(239, 68, 68, 0.75)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { dataIndex: number; raw: unknown }) => {
            if (hasTimeSeries) {
              const point = timeSeries[context.dataIndex];
              const isOutlier = point.latencyMs >= metrics.p95Ms;
              return [
                `Latencia: ${context.raw} ms ${isOutlier ? '⚠️ (Outlier p95)' : ''}`,
                `Modelo: ${point.modelName}`,
                `Tokens/s: ${point.tokensPerSecond.toFixed(1)}`,
                `Estado: ${point.status}`,
              ];
            }
            return `${context.raw} ms`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 0 },
      },
      y: {
        grid: { color: '#334155' },
        ticks: {
          color: '#94a3b8',
          callback: (value: unknown) => `${value} ms`,
        },
      },
    },
    onClick: (_event: unknown, elements: Array<{ index: number }>) => {
      if (elements && elements.length > 0 && onOutlierClick && hasTimeSeries) {
        const clickedIndex = elements[0].index;
        const clickedPoint = timeSeries[clickedIndex];
        if (clickedPoint && clickedPoint.latencyMs >= metrics.p95Ms) {
          onOutlierClick(metrics.p95Ms);
        }
      }
    },
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      height: '340px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
          📈 Serie Temporal de Latencia por Interacción
        </h3>
        {onOutlierClick && metrics.p95Ms > 0 && (
          <button
            onClick={() => onOutlierClick(metrics.p95Ms)}
            title="Ver trazas anómalas superiores a p95 en Traces"
            style={{
              padding: '0.25rem 0.6rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-red)',
              borderRadius: '4px',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>🎯 Ver Outliers (≥ {metrics.p95Ms} ms)</span>
          </button>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LatencyTimelineChart;
