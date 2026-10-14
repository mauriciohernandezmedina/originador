export type InteractionStatus = 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'CANCELLED';
export type ToolStatus = 'SUCCESS' | 'ERROR';

export interface ToolInvocationDto {
  toolName: string;
  inputArguments?: string;
  outputResult?: string;
  startedAt: string;
  endedAt: string;
  status?: ToolStatus;
  errorMessage?: string | null;
}

export interface ToolInvocationDetailDto extends ToolInvocationDto {
  id: string;
  durationMs: number;
}

export interface TraceIngestRequest {
  clientTraceId?: string;
  iterationId: string;
  modelName: string;
  promptText: string;
  responseText?: string;
  inputTokens: number;
  outputTokens: number;
  startedAt: string;
  endedAt: string;
  status?: InteractionStatus;
  errorMessage?: string | null;
  tools?: ToolInvocationDto[];
}

export interface TraceResponse {
  id: string;
  iterationId: string;
  modelName: string;
  latencyMs: number;
  tokensPerSecond: number;
  status: InteractionStatus;
  createdAt: string;
}

export interface TraceDetailResponse extends TraceResponse {
  promptText: string;
  responseText: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  startedAt: string;
  endedAt: string;
  errorMessage?: string | null;
  tools: ToolInvocationDetailDto[];
}

export interface BatchIngestResponse {
  receivedCount: number;
  savedCount: number;
  errorsCount: number;
}

export interface IterationSummary {
  id: string;
  name: string;
  description?: string | null;
  totalInteractions: number;
  avgLatencyMs: number;
  avgTokensPerSecond: number;
  successRate: number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface UpdateIterationRequest {
  name?: string;
  description?: string;
}

export interface LatencyMetrics {
  minMs: number;
  avgMs: number;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  maxMs: number;
}

export interface TokenMetrics {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgTokensPerInteraction: number;
  avgTokensPerSecond: number;
}

export interface ToolUsageStat {
  toolName: string;
  callCount: number;
  avgDurationMs: number;
  totalDurationMs: number;
}

export interface TimeSeriesPointDto {
  traceId: string;
  timestamp: string;
  latencyMs: number;
  tokensPerSecond: number;
  totalTokens: number;
  modelName: string;
  status: InteractionStatus | string;
}

export interface PerformanceSummaryDto {
  iterationId?: string | null;
  totalInteractions: number;
  successCount: number;
  errorCount: number;
  errorRatePercentage: number;
  latencyMetrics: LatencyMetrics;
  tokenMetrics: TokenMetrics;
  toolUsage: ToolUsageStat[];
  timeSeries?: TimeSeriesPointDto[];
}

export interface IterationComparisonDto {
  baseIteration: {
    iterationId: string;
    name: string;
    avgLatencyMs: number;
    avgTotalTokens: number;
    avgTokensPerSecond: number;
    errorRatePercentage: number;
  };
  targetIteration: {
    iterationId: string;
    name: string;
    avgLatencyMs: number;
    avgTotalTokens: number;
    avgTokensPerSecond: number;
    errorRatePercentage: number;
  };
  deltas: {
    latencyDeltaPercentage: number;
    tokensDeltaPercentage: number;
    speedupPercentage: number;
    errorRateDelta: number;
  };
}

export interface PaginatedTracesResponse {
  content: TraceResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
}
