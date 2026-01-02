import { useState } from 'react';
import { Calendar, ChevronDown, User } from 'lucide-react';
import { cn } from '../../utils/cn';

export function TopBar() {
  const [dateRange, setDateRange] = useState('7d');
  const [environment, setEnvironment] = useState('Dev');

  return (
    <header className="fixed left-64 top-0 right-0 z-40 h-16 border-b border-dark-border-primary bg-glass-bg backdrop-blur-glass transition-all duration-300">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-dark-text-primary">DevSecOps Security Dashboard</h1>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={cn(
                'appearance-none rounded-lg border border-dark-border-primary bg-dark-bg-tertiary',
                'px-4 py-2 pr-8 text-sm text-dark-text-primary',
                'transition-colors hover:border-dark-border-accent hover:bg-dark-bg-elevated',
                'focus:outline-none focus:ring-2 focus:ring-semantic-info/20 focus:border-semantic-info'
              )}
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <Calendar className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-text-secondary" />
          </div>

          {/* Environment Selector */}
          <div className="relative">
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className={cn(
                'appearance-none rounded-lg border border-dark-border-primary bg-dark-bg-tertiary',
                'px-4 py-2 pr-8 text-sm text-dark-text-primary',
                'transition-colors hover:border-dark-border-accent hover:bg-dark-bg-elevated',
                'focus:outline-none focus:ring-2 focus:ring-semantic-info/20 focus:border-semantic-info'
              )}
            >
              <option value="Dev">Dev</option>
              <option value="Staging">Staging</option>
              <option value="Prod">Prod</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-text-secondary" />
          </div>

          {/* User Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-purple">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

