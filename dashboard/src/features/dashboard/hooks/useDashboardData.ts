/**
 * Dashboard Data Hook
 * Fetches real-time dashboard data from API
 */

import { useQuery } from '@tanstack/react-query';
import { scansApi } from '../../../shared/api/services/scans';
import { findingsApi } from '../../../shared/api/services/findings';
import { repositoriesApi } from '../../../shared/api/services/repositories';

export function useDashboardData(repositoryId?: string) {
  // Fetch repositories
  const { 
    data: repositories, 
    isLoading: reposLoading, 
    error: reposError 
  } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      console.log('Fetching repositories...');
      try {
        const response = await repositoriesApi.list();
        console.log('Repositories response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to fetch repositories');
        return response.data;
      } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
      }
    },
    retry: 1,
  });

  // Get first repository if none specified
  const activeRepositoryId = repositoryId || repositories?.[0]?.id;

  // Fetch latest scan
  const { 
    data: latestScan, 
    isLoading: scanLoading, 
    error: scanError 
  } = useQuery({
    queryKey: ['scans', 'latest', activeRepositoryId],
    queryFn: async () => {
      if (!activeRepositoryId) {
        console.log('No active repository ID, skipping scan fetch');
        return null;
      }
      console.log('Fetching latest scan for repository:', activeRepositoryId);
      try {
        const response = await scansApi.getLatest(activeRepositoryId);
        console.log('Latest scan response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to fetch latest scan');
        return response.data;
      } catch (error) {
        console.error('Error fetching latest scan:', error);
        throw error;
      }
    },
    enabled: !!activeRepositoryId,
    retry: 1,
  });

  // Fetch findings for latest scan
  const { 
    data: findings, 
    isLoading: findingsLoading, 
    error: findingsError 
  } = useQuery({
    queryKey: ['findings', latestScan?.id],
    queryFn: async () => {
      if (!latestScan?.id) {
        console.log('No scan ID, returning empty findings');
        return { findings: [], pagination: { total: 0, limit: 50, offset: 0, hasMore: false } };
      }
      console.log('Fetching findings for scan:', latestScan.id);
      try {
        const response = await findingsApi.list({ scanId: latestScan.id, limit: 100 });
        console.log('Findings response:', response);
        if (!response.success) throw new Error(response.error || 'Failed to fetch findings');
        return response.data;
      } catch (error) {
        console.error('Error fetching findings:', error);
        throw error;
      }
    },
    enabled: !!latestScan?.id,
    retry: 1,
  });

  return {
    repositories,
    activeRepositoryId,
    latestScan,
    findings: findings?.findings || [],
    isLoading: reposLoading || scanLoading || findingsLoading,
    error: reposError || scanError || findingsError,
  };
}

