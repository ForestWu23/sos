import React from 'react';

interface TagProps {
  color?: 'blue' | 'purple' | 'green' | 'red' | 'success' | 'error';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

const Tag: React.FC<TagProps> = ({ color = 'blue', children, className = '', style }) => {
  const classes = colorMap[color] ?? colorMap.blue;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${classes} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};

export default Tag;
