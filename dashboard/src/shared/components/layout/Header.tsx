/**
 * Header Component
 * Modern application header with status indicators
 */

import { Shield, Wifi, WifiOff, Bell, Search, User, Scan } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useWebSocket } from '../../../app/providers/WebSocketProvider';
import { cn } from '../../lib/utils';

export function Header() {
  const { isConnected } = useWebSocket();
  const location = useLocation();

  return (
    <header className={cn(
      'sticky top-0 z-40',
      'border-b border-border/50',
      'bg-bg-primary/80 backdrop-blur-xl',
      'shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
    )}>
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo & Title */}
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-purple shadow-glow-purple">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                DevSecOps Dashboard
              </h1>
              <p className="text-xs text-text-tertiary">
                Enterprise Security Monitoring
              </p>
            </div>
          </Link>

          {/* Center: Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search findings, tools, files..."
                className={cn(
                  'w-full h-9 pl-10 pr-4 rounded-lg',
                  'bg-bg-tertiary/50 border border-border/50',
                  'text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:border-info/50 focus:ring-1 focus:ring-info/30',
                  'transition-all duration-200'
                )}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-bg-secondary px-1.5 text-[10px] text-text-muted">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Scan Repository Button */}
            <Link
              to="/scan"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'text-sm font-medium transition-all duration-200',
                location.pathname === '/scan'
                  ? 'bg-info/20 text-info border border-info/30'
                  : 'bg-info/10 text-info hover:bg-info/20 border border-info/20',
                'focus:outline-none focus:ring-2 focus:ring-info/50'
              )}
            >
              <Scan className="h-4 w-4" />
              <span className="hidden sm:inline">Scan Repository</span>
            </Link>

            {/* Connection Status */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              isConnected
                ? 'bg-success/10 border border-success/20'
                : 'bg-bg-tertiary border border-border/50'
            )}>
              {isConnected ? (
                <>
                  <div className="relative">
                    <Wifi className="h-4 w-4 text-success" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
                  </div>
                  <span className="text-xs font-medium text-success hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-text-tertiary" />
                  <span className="text-xs text-text-tertiary hidden sm:inline">Offline</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <button className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg',
              'text-text-secondary hover:text-text-primary',
              'hover:bg-bg-tertiary/70 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-info/50'
            )}>
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error shadow-[0_0_6px_rgba(248,81,73,0.5)]" />
            </button>

            {/* User Menu */}
            <button className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              'bg-bg-tertiary/50 border border-border/50',
              'text-text-secondary hover:text-text-primary',
              'hover:border-border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-info/50'
            )}>
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
