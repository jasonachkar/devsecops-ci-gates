/**
 * Main App Component
 * Enterprise-grade application structure
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { WebSocketProvider } from './app/providers/WebSocketProvider';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { Header } from './shared/components/layout/Header';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';

// Get base path from Vite config (for GitHub Pages deployment)
// Handle both development and production scenarios
const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  // Remove trailing slash, but keep single slash for root
  // If base is just '/', return '/', otherwise remove trailing slash
  if (base === '/' || base === '') {
    return '/';
  }
  return base.replace(/\/$/, '');
};

function App() {
  const basePath = getBasePath();
  
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <WebSocketProvider>
            <BrowserRouter basename={basePath}>
              <div className="min-h-screen bg-bg-primary">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </WebSocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
