import { createContext } from 'react';

export const FormFieldContext = createContext<{ label: string; error?: string; errorId: string } | null>(null);
