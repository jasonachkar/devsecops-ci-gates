/**
 * Compliance API Service
 * Real API integration for compliance scorecards
 */

import { apiClient, type ApiResponse } from '../client';
import type { ComplianceScore } from '../../types/api';

export interface GetComplianceParams {
  repositoryId?: string;
  scanId?: string;
}

export const complianceApi = {
  /**
   * Get OWASP Top 10 compliance scorecard
   */
  async getOwaspTop10(params?: GetComplianceParams): Promise<ApiResponse<ComplianceScore[]>> {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.scanId) query.append('scanId', params.scanId);

    return apiClient.get<ComplianceScore[]>(`/compliance/owasp-top10?${query.toString()}`);
  },

  /**
   * Get CWE Top 25 compliance scorecard
   */
  async getCweTop25(params?: GetComplianceParams): Promise<ApiResponse<ComplianceScore[]>> {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.scanId) query.append('scanId', params.scanId);

    return apiClient.get<ComplianceScore[]>(`/compliance/cwe-top25?${query.toString()}`);
  },
};

