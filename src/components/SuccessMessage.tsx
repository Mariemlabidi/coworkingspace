import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  return (
    <div className={`flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
      <CheckCircle className="h-5 w-5 text-green-600" />
      <span className="text-green-700">{message}</span>
    </div>
  );
}