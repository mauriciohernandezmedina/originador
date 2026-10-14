import apiClient from './apiClient';
import {
  BatchIngestResponse,
  PaginatedTracesResponse,
  TraceDetailResponse,
  TraceIngestRequest,
  TraceResponse,
} from '../types/api';

export const traceService = {
  /**
   * Ingest a single LLM interaction trace
   */
  async ingestTrace(traceData: TraceIngestRequest): Promise<TraceResponse> {
    const response = await apiClient.post<TraceResponse>('/traces', traceData);
    return response.data;
  },

  /**
   * Ingest a batch of LLM interaction traces (up to 500)
   */
  async ingestBatch(traces: TraceIngestRequest[]): Promise<BatchIngestResponse> {
    const response = await apiClient.post<BatchIngestResponse>('/traces/batch', traces);
    return response.data;
  },

  /**
   * List paginated traces with optional filtering
   */
  async listTraces(params?: {
    iterationId?: string;
    modelName?: string;
    status?: string;
    minLatency?: number;
    maxLatency?: number;
    page?: number;
    size?: number;
  }): Promise<PaginatedTracesResponse> {
    const response = await apiClient.get<PaginatedTracesResponse>('/traces', { params });
    return response.data;
  },

  /**
   * Get complete trace detail by ID including tools and waterfall
   */
  async getTraceById(id: string): Promise<TraceDetailResponse> {
    const response = await apiClient.get<TraceDetailResponse>(`/traces/${encodeURIComponent(id)}`);
    return response.data;
  },
};

export default traceService;

