interface BackendError {
  data?: {
    message?: string;
    errors?: Array<{ field: string; message: string }>;
    errorCode?: string;
  };
  status?: number;
}

export const getErrorMessage = (error: unknown): string => {
  const err = error as BackendError;

  // Check for validation errors with field-specific messages
  if (err.data?.errors && Array.isArray(err.data.errors)) {
    return err.data.errors.map((e) => e.message).join(', ');
  }

  // Check for general error message
  if (err.data?.message) {
    return err.data.message;
  }

  // Fallback to generic message
  return 'An error occurred. Please try again.';
};
