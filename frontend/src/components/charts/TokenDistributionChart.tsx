import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TokenMetrics } from '../../types/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TokenDistributionChartProps {
  metrics: TokenMetrics;
}

export const TokenDistributionChart: React.FC<TokenDistributionChartProps> = ({ metrics }) => {
  const data = {
    labels: ['Tokens de Entrada', 'Tokens de Salida', 'Total Acumulado'],
    datasets: [
      {
        label: 'Conteo de Tokens',
        data: [metrics.totalInputTokens, metrics.totalOutputTokens, metrics.totalTokens],
        backgroundColor: [
          'rgba(56, 189, 248, 0.7)',  // Blue
          'rgba(168, 85, 247, 0.7)',  // Purple
          'rgba(34, 197, 94, 0.7)',   // Green
        ],
        borderColor: [
          '#38bdf8',
          '#a855f7',
          '#22c55e',
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: unknown }) => `${Number(context.raw).toLocaleString()} tokens`,
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
          callback: (value: unknown) => Number(value).toLocaleString(),
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
          🔤 Consumo de Tokens (Input vs Output)
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-purple)' }}>
          {metrics.avgTokensPerSecond} tokens/seg prom.
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default TokenDistributionChart;
