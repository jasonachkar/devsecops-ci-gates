/**
 * Repository Selector Component
 * Modern dropdown for repository selection
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { repositoriesApi } from '../api/services/repositories';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { ChevronDown, GitBranch, Check } from 'lucide-react';
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
      <div className="h-10 w-48 skeleton rounded-xl" />
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
        className="gap-2 min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-text-tertiary" />
          <span className="truncate">{selectedRepo?.name || 'Select Repository'}</span>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 text-text-tertiary transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <Card className="absolute top-full mt-2 right-0 z-20 min-w-[220px] max-h-72 overflow-hidden animate-fade-in">
            <CardContent className="p-1.5">
              <div className="space-y-0.5">
                {repositories.map((repo) => {
                  const isSelected = selectedId === repo.id;
                  return (
                    <button
                      key={repo.id}
                      onClick={() => {
                        onSelect(repo.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm',
                        'transition-all duration-150',
                        isSelected
                          ? 'bg-info/10 text-info'
                          : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GitBranch className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isSelected ? 'text-info' : 'text-text-tertiary'
                        )} />
                        <span className="truncate">{repo.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-info flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
