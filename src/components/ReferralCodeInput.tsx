import React, { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { referralService, ReferralValidation } from '@/services/referralService';

interface ReferralCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onValidation: (validation: ReferralValidation) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ReferralCodeInput: React.FC<ReferralCodeInputProps> = ({
  value,
  onChange,
  onValidation,
  disabled = false,
  placeholder = "Enter referral code",
  className = ""
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ReferralValidation | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced validation
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (!value || value.trim().length === 0) {
      setValidation(null);
      onValidation({ isValid: false, error: '' });
      return;
    }

    setIsValidating(true);
    const timer = setTimeout(async () => {
      try {
        const result = await referralService.validateReferralCode(value);
        setValidation(result);
        onValidation(result);
      } catch (error) {
        console.error('Error validating referral code:', error);
        const errorResult = { isValid: false, error: 'Failed to validate code' };
        setValidation(errorResult);
        onValidation(errorResult);
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value, onValidation]);

  const getInputStyles = () => {
    if (isValidating) {
      return "border-yellow-300 bg-yellow-50";
    }
    if (validation?.isValid) {
      return "border-green-500 bg-green-50";
    }
    if (validation && !validation.isValid) {
      return "border-red-500 bg-red-50";
    }
    return "border-gray-300 bg-white";
  };

  const getIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
    }
    if (validation?.isValid) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (validation && !validation.isValid) {
      return <X className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 pr-10 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors duration-200
            ${getInputStyles()}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getIcon()}
        </div>
      </div>

      {/* Validation Messages */}
      {validation && (
        <div className="mt-2 text-sm">
          {validation.isValid && validation.teamMemberName && (
            <div className="text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              Valid code from {validation.teamMemberName}
            </div>
          )}
          {!validation.isValid && validation.error && (
            <div className="text-red-600 flex items-center gap-1">
              <X className="h-3 w-3" />
              {validation.error}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!validation && value && (
        <div className="mt-2 text-sm text-gray-500">
          Validating referral code...
        </div>
      )}
    </div>
  );
};

export default ReferralCodeInput;
