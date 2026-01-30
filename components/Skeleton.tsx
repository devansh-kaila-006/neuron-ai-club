
import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`animate-pulse bg-white/5 rounded-xl ${className}`}
          style={{ minHeight: '1rem' }}
        />
      ))}
    </>
  );
};

export default Skeleton;
