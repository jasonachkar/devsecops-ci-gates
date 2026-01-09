import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Shield,
  AlertTriangle,
  Cloud,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pipelines', label: 'Pipelines', icon: GitBranch },
  { path: '/gates', label: 'Security Gates', icon: Shield },
  { path: '/vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
  { path: '/cloud', label: 'Cloud Posture', icon: Cloud },
  { path: '/compliance', label: 'Compliance', icon: FileCheck },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out',
        'bg-bg-secondary/95 backdrop-blur-xl border-r border-border',
        'shadow-[1px_0_10px_rgba(0,0,0,0.3)]',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-purple shadow-glow-purple">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary tracking-tight">DevSecOps</span>
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Security Dashboard</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-purple shadow-glow-purple mx-auto">
              <Shield className="h-5 w-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              'text-text-secondary transition-all duration-200',
              'hover:bg-bg-tertiary hover:text-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-info/50',
              collapsed && 'absolute -right-3 top-4 bg-bg-secondary border border-border shadow-md'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  'transition-all duration-200 relative',
                  isActive
                    ? 'bg-info/10 text-info shadow-glow-sm'
                    : 'text-text-secondary hover:bg-bg-tertiary/70 hover:text-text-primary'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-info shadow-[0_0_8px_rgba(88,166,255,0.5)]" />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0 transition-all duration-200',
                    isActive ? 'text-info' : 'text-text-tertiary group-hover:text-text-primary'
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className={cn(
                    'absolute left-full ml-2 px-2 py-1 rounded-md',
                    'bg-bg-elevated border border-border shadow-lg',
                    'text-xs text-text-primary whitespace-nowrap',
                    'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                    'transition-all duration-150 z-50'
                  )}>
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/50">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary/50',
            collapsed && 'justify-center'
          )}>
            <div className="h-2 w-2 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
            {!collapsed && (
              <span className="text-xs text-text-tertiary">System Online</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
