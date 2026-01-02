/**
 * Header Component
 * Main application header with navigation
 */

import { Shield, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../../../app/providers/WebSocketProvider';

export function Header() {
  const { isConnected } = useWebSocket();

  return (
    <header className="border-b border-border bg-bg-secondary sticky top-0 z-50 backdrop-blur-sm bg-bg-secondary/95">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
              <Shield className="h-5 w-5 text-info" />
            </div>
            <h1 className="text-lg font-semibold text-text-primary">DevSecOps Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-success" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-text-tertiary" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

