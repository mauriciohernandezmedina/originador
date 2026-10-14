import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  badge?: string;
  onClick?: () => void;
  clickHint?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'var(--accent-blue)',
  badge,
  onClick,
  clickHint,
}) => {
  return (
    <div
      onClick={onClick}
      title={clickHint || (onClick ? `Filtrar trazas por ${title}` : undefined)}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.transform = 'none';
        }
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        backgroundColor: color,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {title}
        </span>
        {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </span>
        {badge && (
          <span style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-tertiary)',
            color: color,
            fontWeight: 600,
          }}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

export default KpiCard;
