import { useState } from 'react';

interface FormState {
    isSubmitting: boolean;
    isSuccess: boolean;
    error: string | null;
}

interface UseFormStateReturn extends FormState {
    setSubmitting: (isSubmitting: boolean) => void;
    setSuccess: (isSuccess: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useFormState = (initialState?: Partial<FormState>): UseFormStateReturn => {
    const [isSubmitting, setSubmitting] = useState(initialState?.isSubmitting || false);
    const [isSuccess, setSuccess] = useState(initialState?.isSuccess || false);
    const [error, setError] = useState<string | null>(initialState?.error || null);

    const reset = () => {
        setSubmitting(false);
        setSuccess(false);
        setError(null);
    };

    return {
        isSubmitting,
        isSuccess,
        error,
        setSubmitting,
        setSuccess,
        setError,
        reset,
    };
};
