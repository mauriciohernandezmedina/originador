import React, { useState } from 'react';
import { getStoredApiKey, setStoredApiKey } from '../../services/apiClient';

interface HeaderProps {
  onSeedData?: () => void;
  onResetData?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onSeedData, onResetData, isLoading }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [showBanner, setShowBanner] = useState(true);

  const handleSaveKey = () => {
    setStoredApiKey(tempKey);
    setApiKey(tempKey);
    setShowKeyModal(false);
  };

  const handleResetWithConfirm = () => {
    if (window.confirm('¿Está seguro de que desea eliminar todas las iteraciones y trazas registradas? Esta acción no se puede deshacer.')) {
      onResetData?.();
    }
  };

  return (
    <>
      {/* Demo Mode Notification Banner */}
      {showBanner && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem',
          color: '#93c5fd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>💡 <strong>Modo Demostración Rápido:</strong></span>
            <span>
              Explore el tablero, deltas de iteraciones y cascada de herramientas precargando 3 iteraciones reales y 30+ trazas interactivas.
            </span>
            {onSeedData && (
              <button
                onClick={onSeedData}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  textDecoration: 'underline',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  fontSize: '0.825rem',
                }}
              >
                Poblar ahora con un solo clic →
              </button>
            )}
          </div>
          <button
            onClick={() => setShowBanner(false)}
            title="Cerrar banner"
            style={{
              background: 'none',
              border: 'none',
              color: '#93c5fd',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0 0.5rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '1.2rem',
          }}>
            ⚡
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              LLM Performance Analytics
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Originador • Spring Boot 3.4 (Java 25 LTS) & React
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onSeedData && (
            <button
              onClick={onSeedData}
              disabled={isLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--accent-blue)',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Cargando...' : '🌱 Cargar Datos Demo'}
            </button>
          )}

          {onResetData && (
            <button
              onClick={handleResetWithConfirm}
              disabled={isLoading}
              style={{
                padding: '0.5rem 0.85rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              🗑️ Limpiar
            </button>
          )}

          <button
            onClick={() => {
              setTempKey(apiKey);
              setShowKeyModal(true);
            }}
            style={{
              padding: '0.5rem 0.85rem',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            🔑 <span style={{ fontSize: '0.8rem' }}>API Key</span>
          </button>
        </div>

        {/* API Key Modal */}
        {showKeyModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.5rem',
              width: '450px',
              maxWidth: '90%',
            }}>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Configurar API Key</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Esta clave se envía en el encabezado <code>X-API-Key</code> de todas las peticiones a la API REST.
              </p>
              <input
                type="text"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="originador-llm-secret-key-2026"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowKeyModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveKey}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--accent-blue)',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Guardar Clave
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
