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
import { ToolUsageStat } from '../../types/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ToolBreakdownChartProps {
  toolUsage: ToolUsageStat[];
}

export const ToolBreakdownChart: React.FC<ToolBreakdownChartProps> = ({ toolUsage }) => {
  if (!toolUsage || toolUsage.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        height: '320px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--text-secondary)',
      }}>
        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛠️</span>
        <p>No se registraron llamadas a herramientas en este periodo.</p>
        <span style={{ fontSize: '0.75rem' }}>Las interacciones son de chat puro.</span>
      </div>
    );
  }

  const labels = toolUsage.map((t) => t.toolName);
  const callCounts = toolUsage.map((t) => t.callCount);
  const avgDurations = toolUsage.map((t) => t.avgDurationMs);

  const data = {
    labels,
    datasets: [
      {
        label: 'Invocaciones (veces)',
        data: callCounts,
        backgroundColor: 'rgba(56, 189, 248, 0.75)',
        borderColor: '#38bdf8',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yCount',
      },
      {
        label: 'Duración Media (ms)',
        data: avgDurations,
        backgroundColor: 'rgba(234, 179, 8, 0.75)',
        borderColor: '#eab308',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'yDuration',
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
          label: (context: { datasetIndex: number; raw: unknown }) => {
            if (context.datasetIndex === 0) {
              return ` ${context.raw} llamadas`;
            }
            return ` ${context.raw} ms promedio`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' },
      },
      yCount: {
        type: 'linear' as const,
        position: 'left' as const,
        grid: { color: '#334155' },
        ticks: { color: '#38bdf8' },
        title: {
          display: true,
          text: 'Frecuencia',
          color: '#38bdf8',
        },
      },
      yDuration: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#eab308' },
        title: {
          display: true,
          text: 'Duración (ms)',
          color: '#eab308',
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
        🛠️ Frecuencia y Duración por Herramienta
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ToolBreakdownChart;
