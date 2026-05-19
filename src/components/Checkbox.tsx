import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, children }) => (
  <label className="inline-flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 cursor-pointer"
    />
    {children}
  </label>
);

export default Checkbox;
