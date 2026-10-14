import React from 'react';

interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = '100px',
  width = '100%',
  borderRadius = '8px',
}) => {
  return (
    <div style={{
      height,
      width,
      borderRadius,
      backgroundColor: 'var(--bg-tertiary)',
      animation: 'pulse 1.5s infinite ease-in-out',
      opacity: 0.6,
    }}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
