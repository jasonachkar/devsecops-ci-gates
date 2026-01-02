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
        'fixed left-0 top-0 z-50 h-screen transition-all duration-300',
        'bg-glass-bg backdrop-blur-glass border-r border-dark-border-primary',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center justify-between border-b border-dark-border-primary px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-purple">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-dark-text-primary">DevSecOps</span>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-purple mx-auto">
              <Shield className="h-5 w-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-dark-text-secondary transition-colors hover:bg-dark-bg-tertiary hover:text-dark-text-primary"
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
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'relative',
                  isActive
                    ? 'bg-dark-bg-tertiary text-dark-text-primary shadow-glow-subtle'
                    : 'text-dark-text-secondary hover:bg-dark-bg-tertiary/50 hover:text-dark-text-primary'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-purple" />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-semantic-info' : 'text-dark-text-secondary group-hover:text-dark-text-primary'
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

