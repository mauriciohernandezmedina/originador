import { TraceResponse } from '../types/api';

/**
 * Trigger browser file download from a Blob
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export traces to a JSON file
 */
export function exportTracesToJson(traces: TraceResponse[], filename: string = 'traces-export.json') {
  const jsonContent = JSON.stringify(traces, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Escape CSV fields according to RFC 4180
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export traces to a CSV file
 */
export function exportTracesToCsv(traces: TraceResponse[], filename: string = 'traces-export.csv') {
  const headers = [
    'ID',
    'Iteration ID',
    'Model Name',
    'Latency (ms)',
    'Tokens Per Second',
    'Status',
    'Created At',
  ];

  const rows = traces.map((t) => [
    escapeCsvValue(t.id),
    escapeCsvValue(t.iterationId),
    escapeCsvValue(t.modelName),
    escapeCsvValue(t.latencyMs),
    escapeCsvValue(t.tokensPerSecond),
    escapeCsvValue(t.status),
    escapeCsvValue(t.createdAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\r\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}
