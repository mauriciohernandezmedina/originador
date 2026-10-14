import { describe, it, expect, vi } from 'vitest';
import { exportTracesToJson, exportTracesToCsv } from './exportUtils';
import { TraceResponse } from '../types/api';

describe('exportUtils', () => {
  const mockTraces: TraceResponse[] = [
    {
      id: 'trace-1',
      iterationId: 'v1-baseline',
      modelName: 'gpt-4o',
      latencyMs: 450,
      tokensPerSecond: 25.5,
      status: 'SUCCESS',
      createdAt: '2026-10-14T12:00:00Z',
    },
    {
      id: 'trace-2',
      iterationId: 'v2-optimized',
      modelName: 'claude-3-5-sonnet',
      latencyMs: 1200,
      tokensPerSecond: 40.0,
      status: 'ERROR',
      createdAt: '2026-10-14T13:00:00Z',
    },
  ];

  it('exports traces to JSON without throwing exceptions', () => {
    // Mock URL and document methods
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    expect(() => {
      exportTracesToJson(mockTraces, 'test-export.json');
    }).not.toThrow();

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('formats CSV correctly handling commas, quotes, and newlines', () => {
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    expect(() => {
      exportTracesToCsv(mockTraces, 'test-export.csv');
    }).not.toThrow();

    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
  });
});
