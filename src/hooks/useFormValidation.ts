import { useState, useCallback } from "react";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

interface UseFormValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  validateField: (name: string, value: any) => string | null;
  validateForm: (data: Record<string, any>) => boolean;
  clearError: (name: string) => void;
  clearAllErrors: () => void;
  setError: (name: string, error: string) => void;
  hasError: (name: string) => boolean;
}

const useFormValidation = (
  schema: ValidationSchema,
): UseFormValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (name: string, value: any): string | null => {
      const rule = schema[name];
      if (!rule) return null;

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        return "This field is required";
      }

      // Skip other validations if field is empty and not required
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return null;
      }

      const stringValue = String(value).trim();

      // Length validations
      if (rule.minLength && stringValue.length < rule.minLength) {
        return `Minimum ${rule.minLength} characters required`;
      }

      if (rule.maxLength && stringValue.length > rule.maxLength) {
        return `Maximum ${rule.maxLength} characters allowed`;
      }

      // Email validation
      if (rule.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stringValue)) {
          return "Please enter a valid email address";
        }
      }

      // Phone validation (Indian format)
      if (rule.phone) {
        // Remove all spaces, dashes, and other non-digit characters except +
        const cleanValue = stringValue.replace(/[\s\-\(\)]/g, "");

        // Various Indian phone number formats
        const phonePatterns = [
          /^\+91[6789]\d{9}$/, // +91XXXXXXXXXX
          /^91[6789]\d{9}$/, // 91XXXXXXXXXX
          /^0[6789]\d{9}$/, // 0XXXXXXXXXX
          /^[6789]\d{9}$/, // XXXXXXXXXX
        ];

        const isValid = phonePatterns.some((pattern) =>
          pattern.test(cleanValue),
        );

        if (!isValid) {
          return "Please enter a valid Indian phone number (10 digits starting with 6, 7, 8, or 9)";
        }
      }

      // URL validation
      if (rule.url) {
        try {
          new URL(
            stringValue.startsWith("http")
              ? stringValue
              : `https://${stringValue}`,
          );
        } catch {
          return "Please enter a valid URL";
        }
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(stringValue)) {
        return "Please enter a valid format";
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [schema],
  );

  const validateForm = useCallback(
    (data: Record<string, any>): boolean => {
      const newErrors: ValidationErrors = {};
      let isFormValid = true;

      Object.keys(schema).forEach((fieldName) => {
        const error = validateField(fieldName, data[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isFormValid = false;
        }
      });

      setErrors(newErrors);
      return isFormValid;
    },
    [schema, validateField],
  );

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const hasError = useCallback(
    (name: string) => {
      return Boolean(errors[name]);
    },
    [errors],
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError,
    hasError,
  };
};

export default useFormValidation;

// Enhanced validation schemas with better error handling
export const enhancedValidations = {
  email: {
    required: true,
    email: true,
    maxLength: 254,
  },
  phone: {
    required: true,
    phone: true,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => {
      if (!value) return "Password is required";
      if (!/(?=.*[a-z])/.test(value))
        return "Password must contain at least one lowercase letter";
      if (!/(?=.*[A-Z])/.test(value))
        return "Password must contain at least one uppercase letter";
      if (!/(?=.*\d)/.test(value))
        return "Password must contain at least one number";
      if (!/(?=.*[@$!%*?&])/.test(value))
        return "Password must contain at least one special character";
      return null;
    },
  },
  url: {
    url: true,
  },
  required: {
    required: true,
  },
  amount: {
    required: true,
    custom: (value: string | number) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(num)) return "Please enter a valid amount";
      if (num < 0) return "Amount cannot be negative";
      if (num > 10000000) return "Amount cannot exceed ₹1,00,00,000";
      return null;
    },
  },
  date: {
    required: true,
    custom: (value: any) => {
      if (!value) return "Date is required";
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) return "Please enter a valid date";
      if (date > new Date()) return "Date cannot be in the future";
      return null;
    },
  },
  fraudType: {
    required: true,
    custom: (value: string) => {
      const validTypes = [
        "phone_call",
        "sms_fraud",
        "email_phishing",
        "online_fraud",
        "financial_fraud",
        "identity_theft",
        "job_fraud",
        "other",
      ];
      if (!validTypes.includes(value))
        return "Please select a valid fraud type";
      return null;
    },
  },
};
