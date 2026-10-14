import React from 'react';

export type NavTab = 'dashboard' | 'iterations' | 'traces';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Tablero & KPIs', icon: '📊' },
    { id: 'iterations', label: 'Iteraciones & Comparativa', icon: '🔄' },
    { id: 'traces', label: 'Explorador de Trazas', icon: '📜' },
  ];

  return (
    <nav style={{
      display: 'flex',
      gap: '0.5rem',
      padding: '0.75rem 2rem',
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
              color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
              borderRadius: '6px',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
