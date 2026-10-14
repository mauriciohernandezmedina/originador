import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Navigation, { NavTab } from './components/layout/Navigation';
import apiClient from './services/apiClient';
import DashboardPage from './pages/DashboardPage';
import IterationsPage from './pages/IterationsPage';
import TracesPage from './pages/TracesPage';
import { TraceFilters } from './components/traces/TraceTable';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [traceFilters, setTraceFilters] = useState<TraceFilters | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleNavigateToTraces = (filters: TraceFilters) => {
    setTraceFilters(filters);
    setActiveTab('traces');
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setFeedbackMessage({
        text: 'Acceso no autorizado (HTTP 401). Verifique su API Key en el botón superior.',
        type: 'error',
      });
    };

    window.addEventListener('originador:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('originador:unauthorized', handleUnauthorized);
  }, []);

  const handleSeedData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.post('/sample-data/seed');
      setFeedbackMessage({
        text: res.data.message || 'Datos de muestra cargados exitosamente.',
        type: 'success',
      });
      window.dispatchEvent(new CustomEvent('originador:data-updated'));
    } catch (err: unknown) {
      setFeedbackMessage({
        text: 'Error al cargar datos de muestra. Verifique que el backend esté en ejecución y la API Key sea válida.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      setIsLoading(true);
      await apiClient.delete('/sample-data/reset');
      setFeedbackMessage({
        text: 'Base de datos restablecida correctamente.',
        type: 'success',
      });
      window.dispatchEvent(new CustomEvent('originador:data-updated'));
    } catch (err: unknown) {
      setFeedbackMessage({
        text: 'Error al restablecer la base de datos.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Header
        onSeedData={handleSeedData}
        onResetData={handleResetData}
        isLoading={isLoading}
      />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {feedbackMessage && (
        <div style={{
          padding: '0.75rem 2rem',
          backgroundColor: feedbackMessage.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderBottom: `1px solid ${feedbackMessage.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
          color: feedbackMessage.type === 'success' ? '#4ade80' : '#f87171',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}
          >
            ×
          </button>
        </div>
      )}

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && <DashboardPage onNavigateToTraces={handleNavigateToTraces} />}

        {activeTab === 'iterations' && <IterationsPage />}

        {activeTab === 'traces' && <TracesPage initialFilters={traceFilters} />}
      </main>
    </div>
  );
};

export default App;
