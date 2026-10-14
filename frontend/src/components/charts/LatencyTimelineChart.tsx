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
import { LatencyMetrics } from '../../types/api';

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
  history?: Array<{ label: string; latencyMs: number }>;
}

export const LatencyTimelineChart: React.FC<LatencyTimelineChartProps> = ({ metrics, history }) => {
  const labels = history && history.length > 0
    ? history.map((h) => h.label)
    : ['Min', 'Media', 'p50 (Mediana)', 'p90', 'p95', 'Max'];

  const dataValues = history && history.length > 0
    ? history.map((h) => h.latencyMs)
    : [metrics.minMs, metrics.avgMs, metrics.p50Ms, metrics.p90Ms, metrics.p95Ms, metrics.maxMs];

  const data = {
    labels,
    datasets: [
      {
        label: 'Latencia (ms)',
        data: dataValues,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#38bdf8',
        pointRadius: 4,
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
          label: (context: { raw: unknown }) => `${context.raw} ms`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' },
      },
      y: {
        grid: { color: '#334155' },
        ticks: {
          color: '#94a3b8',
          callback: (value: unknown) => `${value} ms`,
        },
      },
    },
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      height: '320px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        📈 Evolución y Distribución de Latencia (ms)
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LatencyTimelineChart;
