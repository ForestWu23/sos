import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

type AddToastFn = (message: string, type?: ToastItem['type']) => void;

let _addToast: AddToastFn | null = null;

export const toast = {
  success: (msg: string) => _addToast?.(msg, 'success'),
  error: (msg: string) => _addToast?.(msg, 'error'),
};

const ToastContext = createContext<AddToastFn>(() => {});

export const useToast = () => useContext(ToastContext);

const ToastNotification: React.FC<{ item: ToastItem; onRemove: (id: number) => void }> = ({
  item,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), 3000);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white
        ${item.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {item.type === 'success' ? (
        <CheckCircle size={16} />
      ) : (
        <XCircle size={16} />
      )}
      {item.message}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback<AddToastFn>((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  _addToast = addToast;

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastNotification key={t.id} item={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
