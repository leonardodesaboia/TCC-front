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
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos 1 caractere especial'),
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
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos 1 caractere especial'),
});

export const proRegisterStep1Schema = z.object({
  cpf: z.string().min(1, 'CPF é obrigatório').refine((val) => validateCPF(val), 'CPF inválido'),
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Mínimo 3 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
});

export const proRegisterStep2Schema = z.object({
  bio: z.string().min(1, 'Bio é obrigatória').min(10, 'Mínimo 10 caracteres'),
  yearsOfExperience: z.string()
    .min(1, 'Experiência é obrigatória')
    .refine((value) => {
      const years = Number(value.replace(/\D/g, ''));
      return Number.isFinite(years) && years >= 0 && years <= 99;
    }, 'Informe um valor entre 0 e 99 anos'),
  baseHourlyRate: z.string()
    .min(1, 'Valor/hora é obrigatório')
    .refine((value) => {
      const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
      return Number.isFinite(parsed) && parsed > 0;
    }, 'Informe um valor/hora válido'),
});

export const proRegisterStep3Schema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos 1 letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos 1 letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos 1 número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos 1 caractere especial'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientRegisterStep1Data = z.infer<typeof clientRegisterStep1Schema>;
export type ClientRegisterStep2Data = z.infer<typeof clientRegisterStep2Schema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetCodeFormData = z.infer<typeof resetCodeSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
export type ProRegisterStep1Data = z.infer<typeof proRegisterStep1Schema>;
export type ProRegisterStep2Data = z.infer<typeof proRegisterStep2Schema>;
export type ProRegisterStep3Data = z.infer<typeof proRegisterStep3Schema>;
