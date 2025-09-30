import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = '데이터를 불러오는 중...',
  className = '',
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-primary-600 mx-auto mb-4 ${sizeClasses[size]}`}
        />
        {text && <p className="text-slate-600">{text}</p>}
      </div>
    </div>
  );
};
