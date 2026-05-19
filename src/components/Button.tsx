import React from 'react';

interface ButtonProps {
  type?: 'primary' | 'default' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = 'default',
  size = 'medium',
  icon,
  disabled,
  onClick,
  children,
  className = '',
  title,
}) => {
  const base =
    'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors cursor-pointer select-none';

  const sizeClass = {
    small: 'px-2.5 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-sm',
  }[size];

  const typeClass = {
    primary:
      'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:border-blue-300',
    default:
      'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 active:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200',
    text:
      'bg-transparent border-transparent text-gray-500 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 disabled:text-gray-300',
  }[type];

  return (
    <button
      className={`${base} ${sizeClass} ${typeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
