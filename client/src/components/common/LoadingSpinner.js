import React from 'react';
import { SimpleIcon } from '../icons/SimpleIcons';

const LoadingSpinner = ({ 
  size = 'medium', 
  className = '', 
  text = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <SimpleIcon 
          name="loader" 
          size={size === 'small' ? 16 : size === 'medium' ? 24 : size === 'large' ? 32 : 48}
          className="text-primary-600"
        />
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
