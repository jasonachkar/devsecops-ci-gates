/**
 * Trends API Service
 * Real API integration for trend analysis
 */

import { apiClient, type ApiResponse } from '../client';
import type { TrendDataPoint } from '../../types/api';

export interface GetTrendsParams {
  repositoryId?: string;
  days?: number;
  startDate?: string;
  endDate?: string;
}

export const trendsApi = {
  /**
   * Get historical trend data
   */
  async get(params?: GetTrendsParams): Promise<ApiResponse<TrendDataPoint[]>> {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.days) query.append('days', params.days.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    return apiClient.get<TrendDataPoint[]>(`/trends?${query.toString()}`);
  },
};

