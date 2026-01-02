import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { CloudSecurityPage } from './pages/CloudSecurityPage';
import { Shield, Cloud, BarChart3 } from 'lucide-react';
import { cn } from './utils/cn';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Security Dashboard', icon: Shield },
    { path: '/cloud', label: 'Cloud Security', icon: Cloud },
    { path: '/trends', label: 'Trends & Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="border-b border-dark-border-primary bg-dark-bg-secondary/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl font-bold text-dark-text-primary">DevSecOps Dashboard</h1>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-accent'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-tertiary/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-bg-primary">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cloud" element={<CloudSecurityPage />} />
          <Route path="/trends" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
