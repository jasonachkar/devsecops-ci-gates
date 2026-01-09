/**
 * @fileoverview Repository Selector Component
 * @description Dropdown selector for switching between multiple repositories.
 * Enables multi-repository support in the dashboard.
 * 
 * @module components/repository/RepositorySelector
 */

import { useState, useEffect } from 'react';
import { Select } from '../ui/Select';
import { apiClient } from '../../services/api';

interface Repository {
  id: string;
  name: string;
  url: string;
  provider: string;
  description?: string;
}

interface RepositorySelectorProps {
  value?: string;
  onChange: (repositoryId: string) => void;
}

/**
 * Repository Selector Component
 * @component
 * @param {RepositorySelectorProps} props - Component props
 * @returns {JSX.Element} Repository dropdown selector
 */
export function RepositorySelector({ value, onChange }: RepositorySelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch repositories from API
    // Note: This endpoint would need to be implemented in the backend
    apiClient.getRepositories?.()
      .then((response) => {
        if (response.success && response.data) {
          setRepositories(response.data);
        }
      })
      .catch((error) => {
        console.error('Failed to load repositories:', error);
        // Fallback to default repository if API fails
        setRepositories([{
          id: 'default',
          name: 'Current Repository',
          url: '',
          provider: 'github',
        }]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-48 animate-pulse rounded-lg bg-dark-bg-tertiary" />
    );
  }

  return (
    <Select
      value={value || repositories[0]?.id || ''}
      onChange={(event) => onChange(event.target.value)}
      className="w-64"
    >
      {repositories.map((repo) => (
        <option key={repo.id} value={repo.id}>
          {repo.name}
        </option>
      ))}
    </Select>
  );
}

