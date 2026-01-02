/**
 * Findings API Service
 * Real API integration for findings management
 */

import { apiClient, type ApiResponse } from '../client';
import type { Finding, PaginationParams, PaginationMeta, SeverityLevel, FindingStatus } from '../../types/api';

export interface ListFindingsParams extends PaginationParams {
  repositoryId?: string;
  scanId?: string;
  severity?: SeverityLevel;
  tool?: string;
  status?: FindingStatus;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListFindingsResponse {
  findings: Finding[];
  pagination: PaginationMeta;
}

export interface UpdateFindingData {
  status?: FindingStatus;
  assignedTo?: string;
}

export const findingsApi = {
  /**
   * Get list of findings with advanced filtering
   */
  async list(params?: ListFindingsParams): Promise<ApiResponse<ListFindingsResponse>> {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.scanId) query.append('scanId', params.scanId);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.tool) query.append('tool', params.tool);
    if (params?.status) query.append('status', params.status);
    if (params?.assignedTo) query.append('assignedTo', params.assignedTo);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    return apiClient.get<ListFindingsResponse>(`/findings?${query.toString()}`);
  },

  /**
   * Get finding by ID
   */
  async getById(findingId: string): Promise<ApiResponse<Finding>> {
    return apiClient.get<Finding>(`/findings/${findingId}`);
  },

  /**
   * Update finding status or assignment
   */
  async update(findingId: string, data: UpdateFindingData): Promise<ApiResponse<Finding>> {
    return apiClient.patch<Finding>(`/findings/${findingId}`, data);
  },
};

