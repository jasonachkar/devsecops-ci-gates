/**
 * Scans API Service
 * Real API integration for scan management
 */

import { apiClient, type ApiResponse } from '../client';
import type { Scan, PaginationParams, PaginationMeta } from '../../types/api';

export interface ListScansParams extends PaginationParams {
  repositoryId?: string;
  branch?: string;
  status?: string;
}

export interface ListScansResponse {
  scans: Scan[];
  pagination: PaginationMeta;
}

export const scansApi = {
  /**
   * Get list of scans with filtering
   */
  async list(params?: ListScansParams): Promise<ApiResponse<ListScansResponse>> {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.branch) query.append('branch', params.branch);
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return apiClient.get<ListScansResponse>(`/scans?${query.toString()}`);
  },

  /**
   * Get scan by ID
   */
  async getById(scanId: string): Promise<ApiResponse<Scan>> {
    return apiClient.get<Scan>(`/scans/${scanId}`);
  },

  /**
   * Get latest scan for a repository
   */
  async getLatest(repositoryId: string): Promise<ApiResponse<Scan>> {
    return apiClient.get<Scan>(`/scans/latest?repositoryId=${repositoryId}`);
  },
};

