import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <span className="text-red-700">{message}</span>
    </div>
  );
}