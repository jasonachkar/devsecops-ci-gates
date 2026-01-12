/**
 * @fileoverview API Client Service
 * @description Centralized HTTP client for all backend API communication.
 * Handles authentication, request/response formatting, and error handling.
 * Provides type-safe methods for all API endpoints.
 * 
 * @module services/api
 */

// Ensure API_BASE_URL always ends with /api/v1
const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  return baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Standard API response structure
 * @template T - Type of the data payload
 * @interface ApiResponse
 */
interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data payload */
  data: T;
  /** Pagination metadata (for list endpoints) */
  pagination?: {
    total: number; // Total number of items
    limit: number; // Items per page
    offset: number; // Current offset
    hasMore: boolean; // Whether more items are available
  };
  /** Error message (if success is false) */
  error?: string;
  /** Additional message */
  message?: string;
}

/**
 * API Client Class
 * @class ApiClient
 * @description Manages all HTTP requests to the backend API
 * Handles authentication tokens, request formatting, and error handling
 */
class ApiClient {
  /** Base URL for all API requests */
  private baseUrl: string;
  /** JWT authentication token (stored in localStorage) */
  private token: string | null = null;

  /**
   * Create a new API client instance
   * @param {string} baseUrl - Base URL for API requests
   * @constructor
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to load existing token from browser localStorage
    // Only works in browser environment (not SSR)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set or clear the authentication token
   * @param {string | null} token - JWT token to use for authentication, or null to clear
   * @description Updates the token and persists it to localStorage
   * When token is null, removes it from localStorage
   */
  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      // Store token in localStorage for persistence across page reloads
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      // Remove token from localStorage when clearing
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Internal method to make HTTP requests
   * @private
   * @template T - Expected response data type
   * @param {string} endpoint - API endpoint path (without base URL)
   * @param {RequestInit} [options={}] - Fetch API options (method, body, etc.)
   * @returns {Promise<ApiResponse<T>>} Parsed API response
   * @throws {Error} If request fails or response is not OK
   * @description Handles authentication headers, error parsing, and response formatting
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    // Build headers with defaults and preserve caller overrides
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json'); // Default to JSON
    }
    // Add JWT token to Authorization header if available
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      // Make HTTP request using Fetch API
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-OK responses (4xx, 5xx)
      if (!response.ok) {
        // Try to parse error response as JSON, fallback to generic error
        const error = await response.json().catch(() => ({
          error: 'Unknown error',
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message || error.error || 'Request failed');
      }

      // Parse and return successful response
      return await response.json();
    } catch (error) {
      // Wrap all errors in Error object with descriptive message
      throw new Error(
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  // Scans
  async getScans(params?: {
    repositoryId?: string;
    branch?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.branch) query.append('branch', params.branch);
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.request<any>(`/scans?${query.toString()}`);
  }

  async getScan(scanId: string) {
    return this.request<any>(`/scans/${scanId}`);
  }

  async getLatestScan(repositoryId: string) {
    return this.request<any>(`/scans/latest?repositoryId=${repositoryId}`);
  }

  // Findings
  async getFindings(params?: {
    repositoryId?: string;
    scanId?: string;
    severity?: string;
    tool?: string;
    status?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }) {
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

    return this.request<any>(`/findings?${query.toString()}`);
  }

  async getFinding(findingId: string) {
    return this.request<any>(`/findings/${findingId}`);
  }

  async updateFinding(findingId: string, data: { status: string; assignedTo?: string }) {
    return this.request<any>(`/findings/${findingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Trends
  async getTrends(params?: {
    repositoryId?: string;
    days?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.days) query.append('days', params.days.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);

    return this.request<any>(`/trends?${query.toString()}`);
  }

  // Compliance
  async getOwaspTop10(params?: { repositoryId?: string; scanId?: string }) {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.scanId) query.append('scanId', params.scanId);

    return this.request<any>(`/compliance/owasp-top10?${query.toString()}`);
  }

  async getCweTop25(params?: { repositoryId?: string; scanId?: string }) {
    const query = new URLSearchParams();
    if (params?.repositoryId) query.append('repositoryId', params.repositoryId);
    if (params?.scanId) query.append('scanId', params.scanId);

    return this.request<any>(`/compliance/cwe-top25?${query.toString()}`);
  }

  // AWS Security Hub
  async syncSecurityHub(awsAccountId?: string) {
    return this.request<any>('/aws/securityhub/sync', {
      method: 'POST',
      body: JSON.stringify({ awsAccountId }),
    });
  }

  async getSecurityHubFindings(params?: {
    severity?: string;
    status?: string;
    awsAccountId?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    if (params?.awsAccountId) query.append('awsAccountId', params.awsAccountId);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.request<any>(`/aws/securityhub/findings?${query.toString()}`);
  }

  // Repositories
  /**
   * Get list of repositories
   * @returns {Promise<ApiResponse>} List of repositories
   */
  async getRepositories() {
    return this.request<any>('/repositories');
  }

  // Remediation
  /**
   * Get remediation tickets
   * @param {Object} [params] - Query parameters
   * @returns {Promise<ApiResponse>} List of tickets
   */
  async getRemediationTickets(params?: {
    scanId?: string;
    findingId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.scanId) query.append('scanId', params.scanId);
    if (params?.findingId) query.append('findingId', params.findingId);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.assignedTo) query.append('assignedTo', params.assignedTo);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.request<any>(`/remediation/tickets?${query.toString()}`);
  }

  /**
   * Create remediation ticket
   * @param {Object} data - Ticket data
   * @returns {Promise<ApiResponse>} Created ticket
   */
  async createRemediationTicket(data: {
    scanId: string;
    findingId?: string;
    title: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: string;
  }) {
    return this.request<any>('/remediation/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // SBOM
  /**
   * Get SBOM records for a scan
   * @param {string} scanId - Scan UUID
   * @param {string} [format] - SBOM format filter
   * @returns {Promise<ApiResponse>} SBOM records
   */
  async getSbomRecords(scanId: string, format?: string) {
    const query = new URLSearchParams();
    query.append('scanId', scanId);
    if (format) query.append('format', format);

    return this.request<any>(`/sbom?${query.toString()}`);
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; version: string }>('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
