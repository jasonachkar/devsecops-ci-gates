/**
 * Repository Selector Component
 * Allows users to select which repository to view
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { repositoriesApi } from '../api/services/repositories';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface RepositorySelectorProps {
  selectedId?: string;
  onSelect: (repositoryId: string) => void;
}

export function RepositorySelector({ selectedId, onSelect }: RepositorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: repositories, isLoading } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => {
      const response = await repositoriesApi.list();
      if (!response.success) throw new Error(response.error || 'Failed to fetch repositories');
      return response.data;
    },
  });

  const selectedRepo = repositories?.find((r) => r.id === selectedId);

  if (isLoading) {
    return (
      <div className="h-10 w-48 bg-bg-secondary rounded-md border border-border animate-pulse" />
    );
  }

  if (!repositories || repositories.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <span>{selectedRepo?.name || 'Select Repository'}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full mt-2 left-0 z-20 min-w-[200px] max-h-64 overflow-auto">
            <CardContent className="p-2">
              <div className="space-y-1">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      onSelect(repo.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      selectedId === repo.id
                        ? 'bg-info/10 text-info'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    )}
                  >
                    {repo.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

