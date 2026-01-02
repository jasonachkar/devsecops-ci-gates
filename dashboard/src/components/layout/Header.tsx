import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header 
      className="border-b"
      style={{ 
        borderColor: '#30363D',
        backgroundColor: '#161B22'
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" style={{ color: '#58A6FF' }} />
            <h1 className="text-lg font-semibold" style={{ color: '#F0F6FC' }}>DevSecOps Dashboard</h1>
          </div>
        </div>
      </div>
    </header>
  );
}

