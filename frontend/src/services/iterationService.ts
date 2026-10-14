import apiClient from './apiClient';
import { IterationComparisonDto, IterationSummary, UpdateIterationRequest } from '../types/api';

export const iterationService = {
  async listIterations(): Promise<IterationSummary[]> {
    const res = await apiClient.get<IterationSummary[]>('/iterations');
    return res.data;
  },

  async getIteration(id: string): Promise<IterationSummary> {
    const res = await apiClient.get<IterationSummary>(`/iterations/${encodeURIComponent(id)}`);
    return res.data;
  },

  async updateIteration(id: string, request: UpdateIterationRequest): Promise<IterationSummary> {
    const res = await apiClient.put<IterationSummary>(`/iterations/${encodeURIComponent(id)}`, request);
    return res.data;
  },

  async compareIterations(baseId: string, targetId: string): Promise<IterationComparisonDto> {
    const res = await apiClient.get<IterationComparisonDto>('/iterations/compare', {
      params: { baseId, targetId },
    });
    return res.data;
  },
};

export default iterationService;
