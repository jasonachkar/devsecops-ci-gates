/**
 * Repositories API Service
 * Real API integration for repository management
 */

import { apiClient, type ApiResponse } from '../client';
import type { Repository } from '../../types/api';

export const repositoriesApi = {
  /**
   * Get list of repositories
   */
  async list(): Promise<ApiResponse<Repository[]>> {
    return apiClient.get<Repository[]>('/repositories');
  },

  /**
   * Get repository by ID
   */
  async getById(repositoryId: string): Promise<ApiResponse<Repository>> {
    return apiClient.get<Repository>(`/repositories/${repositoryId}`);
  },
};

