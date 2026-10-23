import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockRouter = { replace: vi.fn(), back: vi.fn(), push: vi.fn() };

vi.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@/lib/integrations/professional', () => ({
  professionalIntegration: {
    orders: {
      reportScopeMismatch: vi.fn(),
      proposeNewPrice: vi.fn(),
      proposeServiceChange: vi.fn(),
    },
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { useReportScopeMismatch, useProposeNewPrice, useProposeServiceChange } from '../useProfessionalArea';
import { professionalIntegration } from '@/lib/integrations/professional';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useReportScopeMismatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia a descrição da divergência e volta para a lista de pedidos', async () => {
    vi.mocked(professionalIntegration.orders.reportScopeMismatch).mockResolvedValue({} as never);

    const { result } = renderHook(() => useReportScopeMismatch('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate('Era troca de disjuntor, não de tomada');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(professionalIntegration.orders.reportScopeMismatch).toHaveBeenCalledWith(
      'order-1',
      'Era troca de disjuntor, não de tomada',
    );
    expect(mockRouter.replace).toHaveBeenCalledWith('/(professional)/(orders)');

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.success).toHaveBeenCalled();
  });

  it('mostra toast de erro e não navega quando a mutation falha', async () => {
    vi.mocked(professionalIntegration.orders.reportScopeMismatch).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useReportScopeMismatch('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate('Escopo diferente');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.error).toHaveBeenCalledWith('Erro ao relatar escopo divergente', 'boom');
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

describe('useProposeNewPrice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia o novo valor e motivo, e volta para a tela anterior', async () => {
    vi.mocked(professionalIntegration.orders.proposeNewPrice).mockResolvedValue({} as never);

    const { result } = renderHook(() => useProposeNewPrice('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({ newAmount: 150, reason: 'Era troca de disjuntor' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(professionalIntegration.orders.proposeNewPrice).toHaveBeenCalledWith('order-1', {
      newAmount: 150,
      reason: 'Era troca de disjuntor',
    });
    expect(mockRouter.back).toHaveBeenCalled();

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.success).toHaveBeenCalled();
  });

  it('mostra toast de erro e não volta quando a mutation falha', async () => {
    vi.mocked(professionalIntegration.orders.proposeNewPrice).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useProposeNewPrice('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({ newAmount: 150, reason: 'Motivo' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.error).toHaveBeenCalledWith('Erro ao propor novo preço', 'boom');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});

describe('useProposeServiceChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envia o novo serviço e motivo, e volta para a tela anterior', async () => {
    vi.mocked(professionalIntegration.orders.proposeServiceChange).mockResolvedValue({} as never);

    const { result } = renderHook(() => useProposeServiceChange('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({ newServiceId: 'service-2', reason: 'Era manutenção, não instalação' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(professionalIntegration.orders.proposeServiceChange).toHaveBeenCalledWith('order-1', {
      newServiceId: 'service-2',
      reason: 'Era manutenção, não instalação',
    });
    expect(mockRouter.back).toHaveBeenCalled();

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.success).toHaveBeenCalled();
  });

  it('envia a duração estimada quando informada (serviço por hora sem duração própria)', async () => {
    vi.mocked(professionalIntegration.orders.proposeServiceChange).mockResolvedValue({} as never);

    const { result } = renderHook(() => useProposeServiceChange('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({
        newServiceId: 'service-2',
        reason: 'Era manutenção, não instalação',
        estimatedDurationMinutes: 90,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(professionalIntegration.orders.proposeServiceChange).toHaveBeenCalledWith('order-1', {
      newServiceId: 'service-2',
      reason: 'Era manutenção, não instalação',
      estimatedDurationMinutes: 90,
    });
  });

  it('mostra toast de erro e não volta quando a mutation falha', async () => {
    vi.mocked(professionalIntegration.orders.proposeServiceChange).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useProposeServiceChange('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate({ newServiceId: 'service-2', reason: 'Motivo' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.error).toHaveBeenCalledWith('Erro ao propor troca de serviço', 'boom');
    expect(mockRouter.back).not.toHaveBeenCalled();
  });
});
