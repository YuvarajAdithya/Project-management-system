import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div role="status" className="flex justify-center items-center gap-3 p-8 text-sm text-secondary">
      <div aria-hidden="true" className="animate-spin motion-reduce:animate-none rounded-full h-6 w-6 border-2 border-line border-t-info-ink"></div>
      <span>Loading your workspace…</span>
    </div>
  );
};

export default LoadingSpinner;
