import { z } from 'zod';
import { validateCPF } from '@/lib/utils/masks';

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória').min(6, 'Mínimo 6 caracteres'),
});

export const clientRegisterStep1Schema = z.object({
  cpf: z.string().min(1, 'CPF é obrigatório').refine((val) => validateCPF(val), 'CPF inválido'),
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
});

export const clientRegisterStep2Schema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

export const resetCodeSchema = z.object({
  code: z.string().min(4, 'Código deve ter 4 dígitos').max(4, 'Código deve ter 4 dígitos'),
});

export const newPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientRegisterStep1Data = z.infer<typeof clientRegisterStep1Schema>;
export type ClientRegisterStep2Data = z.infer<typeof clientRegisterStep2Schema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetCodeFormData = z.infer<typeof resetCodeSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
