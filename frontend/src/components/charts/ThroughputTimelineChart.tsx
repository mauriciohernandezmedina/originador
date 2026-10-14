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
import { TimeSeriesPointDto } from '../../types/api';

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

interface ThroughputTimelineChartProps {
  timeSeries?: TimeSeriesPointDto[];
  avgTokensPerSecond: number;
}

export const ThroughputTimelineChart: React.FC<ThroughputTimelineChartProps> = ({
  timeSeries,
  avgTokensPerSecond,
}) => {
  const hasData = timeSeries && timeSeries.length > 0;

  const labels = hasData
    ? timeSeries.map((t, idx) => {
        const timeStr = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `#${idx + 1} ${timeStr}`;
      })
    : ['Sin datos'];

  const dataValues = hasData
    ? timeSeries.map((t) => t.tokensPerSecond)
    : [avgTokensPerSecond];

  const data = {
    labels,
    datasets: [
      {
        label: 'Tokens / Segundo',
        data: dataValues,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#a855f7',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `Velocidad Media (${avgTokensPerSecond} tok/s)`,
        data: labels.map(() => avgTokensPerSecond),
        borderColor: 'rgba(34, 197, 94, 0.75)',
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
            if (hasData) {
              const point = timeSeries[context.dataIndex];
              return [
                `Velocidad: ${context.raw} tokens/segundo`,
                `Total Tokens: ${point.totalTokens}`,
                `Modelo: ${point.modelName}`,
              ];
            }
            return `${context.raw} tok/s`;
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
          callback: (value: unknown) => `${value} tok/s`,
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
      height: '340px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
          🚀 Velocidad de Procesamiento (Tokens / Seg) a lo Largo del Tiempo
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
          Promedio: {avgTokensPerSecond} tok/s
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ThroughputTimelineChart;
