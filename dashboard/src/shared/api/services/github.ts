/**
 * GitHub API Service
 * Integration for scanning GitHub repositories
 */

import { apiClient, type ApiResponse } from '../client';

export interface GitHubRepositoryInfo {
  name: string;
  fullName: string;
  description?: string;
  url: string;
  cloneUrl: string;
  sshUrl: string;
  defaultBranch: string;
  language?: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubScanRequest {
  repository: string;
  triggeredBy?: string;
}

export interface GitHubScanResponse {
  scan: {
    id: string;
    repositoryId: string;
    status: string;
    gateStatus: string;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    startedAt: string;
    completedAt?: string;
  };
  repository: {
    id: string;
    name: string;
    url: string;
  };
}

export interface GitHubRepositoryResponse {
  repository: GitHubRepositoryInfo;
  recentCommits: Array<{
    sha: string;
    message: string;
    author?: string;
    date?: string;
    url: string;
  }>;
}

export const githubApi = {
  /**
   * Scan a GitHub repository
   */
  async scanRepository(repository: string, triggeredBy: string = 'manual'): Promise<ApiResponse<GitHubScanResponse>> {
    return apiClient.post<GitHubScanResponse>('/github/scan', {
      repository,
      triggeredBy,
    });
  },

  /**
   * Get repository information without scanning
   */
  async getRepositoryInfo(owner: string, repo: string): Promise<ApiResponse<GitHubRepositoryResponse>> {
    return apiClient.get<GitHubRepositoryResponse>(`/github/repository/${owner}/${repo}`);
  },
};
