/**
 * @fileoverview Scan Store - Zustand state management for security scans
 * @description Manages the current scan data, loading states, and API integration.
 * Handles fetching scans from API, WebSocket updates, and fallback to static files.
 * 
 * @module store/scanStore
 */

import { create } from 'zustand';
import type { ScanData } from '../types/scan';
import { apiClient } from '../services/api';
import { wsService } from '../services/websocket';

/**
 * Scan Store Interface
 * @interface ScanStore
 * @description Defines the shape of the scan store state and actions
 */
interface ScanStore {
  /** Current scan data being displayed */
  currentScan: ScanData | null;
  /** Whether a scan is currently being loaded */
  loading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** UUID of the currently selected repository */
  repositoryId: string | null;

  /**
   * Load a scan from various sources
   * @param {'api' | 'embedded' | 'file'} source - Data source to load from
   * @param {string} [repositoryId] - Repository ID (required for 'api' source)
   */
  loadScan: (source: 'api' | 'embedded' | 'file', repositoryId?: string) => Promise<void>;
  
  /**
   * Load the latest scan for a repository
   * @param {string} repositoryId - Repository UUID
   */
  loadLatestScan: (repositoryId: string) => Promise<void>;
  
  /**
   * Manually set scan data
   * @param {ScanData} data - Scan data to set
   */
  setScan: (data: ScanData) => void;
  
  /**
   * Set the current repository ID
   * @param {string | null} id - Repository UUID or null to clear
   */
  setRepositoryId: (id: string | null) => void;
  
  /**
   * Clear any error state
   */
  clearError: () => void;
}

export const useScanStore = create<ScanStore>((set, get) => {
  // Setup WebSocket listeners
  wsService.on('scan:completed', (data: any) => {
    const { repositoryId } = get();
    if (repositoryId && data.repositoryId === repositoryId) {
      // Reload scan if it's for the current repository
      get().loadLatestScan(repositoryId).catch(console.error);
    }
  });

  return {
    currentScan: null,
    loading: false,
    error: null,
    repositoryId: null,

    loadScan: async (source, repositoryId) => {
      set({ loading: true, error: null });
      try {
        if (source === 'api') {
          if (!repositoryId) {
            throw new Error('Repository ID is required for API source');
          }
          const response = await apiClient.getLatestScan(repositoryId);
          if (response.success && response.data) {
            // Transform API response to ScanData format
            const scanData: ScanData = {
              metadata: {
                timestamp: response.data.completedAt || response.data.createdAt,
                repository: response.data.repository?.name || '',
                branch: response.data.branch,
                commit: response.data.commitSha,
                triggeredBy: response.data.triggeredBy,
              },
              summary: {
                total: response.data.totalFindings,
                bySeverity: {
                  critical: response.data.criticalCount,
                  high: response.data.highCount,
                  medium: response.data.mediumCount,
                  low: response.data.lowCount,
                  info: response.data.infoCount,
                },
                byTool: {}, // Will be populated from findings
              },
              findings: [], // Will be loaded separately
            };

            // Load findings
            const findingsResponse = await apiClient.getFindings({
              scanId: response.data.id,
              limit: 1000,
            });

            if (findingsResponse.success && findingsResponse.data) {
              scanData.findings = findingsResponse.data.map((f: any) => ({
                tool: f.tool,
                category: f.category,
                severity: f.severity,
                ruleId: f.ruleId,
                title: f.title,
                file: f.filePath,
                line: f.lineNumber,
                cwe: f.cwe,
                cvss: f.cvssScore ? Number(f.cvssScore) : undefined,
                message: f.message,
                fingerprint: f.fingerprint,
              }));

              // Calculate byTool summary
              scanData.summary.byTool = scanData.findings.reduce((acc, f) => {
                acc[f.tool] = (acc[f.tool] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
            }

            set({ currentScan: scanData, loading: false, repositoryId });
          } else {
            throw new Error('No scan data returned from API');
          }
        } else if (source === 'embedded') {
          // Try to load from embedded window data
          const data = (window as any).__SCAN_DATA__;
          if (data) {
            set({ currentScan: data, loading: false });
          } else {
            throw new Error('No embedded scan data found');
          }
        } else {
          // Load from static file (fallback)
          // Try multiple paths to work in both dev and production
          const paths = [
            '/data/latest.json',
            '/devsecops-ci-cd-gates/data/latest.json',
            './data/latest.json',
          ];
          
          let lastError: Error | null = null;
          for (const dataPath of paths) {
            try {
              console.log(`Trying to load data from: ${dataPath}`);
              const response = await fetch(dataPath);
              if (response.ok) {
                const data = await response.json();
                console.log('Successfully loaded data:', data);
                set({ currentScan: data, loading: false });
                return;
              } else {
                console.warn(`Failed to load ${dataPath}: ${response.status}`);
                lastError = new Error(`HTTP ${response.status} for ${dataPath}`);
              }
            } catch (err) {
              console.warn(`Error loading ${dataPath}:`, err);
              lastError = err instanceof Error ? err : new Error(String(err));
            }
          }
          
          throw lastError || new Error('Could not load data from any path');
        }
      } catch (error) {
        set({
          error: `Failed to load scan data: ${error instanceof Error ? error.message : String(error)}`,
          loading: false
        });
      }
    },

    /**
     * Load the latest scan for a repository (convenience method)
     * @param {string} repositoryId - Repository UUID
     */
    loadLatestScan: async (repositoryId: string) => {
      await get().loadScan('api', repositoryId);
    },

    /**
     * Manually set scan data (useful for testing or direct data injection)
     * @param {ScanData} data - Scan data to set
     */
    setScan: (data) => set({ currentScan: data, loading: false, error: null }),

    /**
     * Set the current repository ID and join WebSocket room
     * @param {string | null} id - Repository UUID or null
     */
    setRepositoryId: (id: string | null) => {
      set({ repositoryId: id });
      // Join WebSocket room for real-time updates when repository is selected
      if (id) {
        wsService.joinRepository(id);
      }
    },

    /**
     * Clear any error state
     */
    clearError: () => set({ error: null }),
  };
});
