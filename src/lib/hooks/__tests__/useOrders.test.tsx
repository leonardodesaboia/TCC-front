import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('expo-router', () => ({
  useRouter: () => ({ replace: vi.fn(), back: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/lib/integrations/client', () => ({
  clientIntegration: {
    orders: {
      respondNewPrice: vi.fn(),
      respondServiceChange: vi.fn(),
    },
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

import { useRespondNewPrice, useRespondServiceChange } from '../useOrders';
import { clientIntegration } from '@/lib/integrations/client';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRespondNewPrice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aceita a proposta enviando accepted=true e mostra toast de sucesso', async () => {
    vi.mocked(clientIntegration.orders.respondNewPrice).mockResolvedValue({} as never);

    const { result } = renderHook(() => useRespondNewPrice('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(true);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientIntegration.orders.respondNewPrice).toHaveBeenCalledWith('order-1', { accepted: true });

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.success).toHaveBeenCalledWith('Novo preço aceito!', 'O valor do pedido foi atualizado.');
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('recusa a proposta enviando accepted=false e mostra toast informativo', async () => {
    vi.mocked(clientIntegration.orders.respondNewPrice).mockResolvedValue({} as never);

    const { result } = renderHook(() => useRespondNewPrice('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(false);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientIntegration.orders.respondNewPrice).toHaveBeenCalledWith('order-1', { accepted: false });

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.info).toHaveBeenCalledWith('Pedido cancelado.', 'O novo preço foi recusado, sem custo para você.');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('mostra toast de erro quando a mutation falha', async () => {
    vi.mocked(clientIntegration.orders.respondNewPrice).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRespondNewPrice('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(true);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.error).toHaveBeenCalledWith('Erro ao responder proposta', 'Network error');
  });
});

describe('useRespondServiceChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aceita a troca enviando accepted=true e mostra toast de sucesso', async () => {
    vi.mocked(clientIntegration.orders.respondServiceChange).mockResolvedValue({} as never);

    const { result } = renderHook(() => useRespondServiceChange('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(true);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientIntegration.orders.respondServiceChange).toHaveBeenCalledWith('order-1', { accepted: true });

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.success).toHaveBeenCalledWith('Troca de serviço aceita!', 'O serviço do pedido foi atualizado.');
    expect(toast.info).not.toHaveBeenCalled();
  });

  it('recusa a troca enviando accepted=false e mostra toast informativo', async () => {
    vi.mocked(clientIntegration.orders.respondServiceChange).mockResolvedValue({} as never);

    const { result } = renderHook(() => useRespondServiceChange('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(false);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientIntegration.orders.respondServiceChange).toHaveBeenCalledWith('order-1', { accepted: false });

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.info).toHaveBeenCalledWith('Pedido cancelado.', 'A troca de serviço foi recusada, sem custo para você.');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('mostra toast de erro quando a mutation falha', async () => {
    vi.mocked(clientIntegration.orders.respondServiceChange).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRespondServiceChange('order-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(true);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.error).toHaveBeenCalledWith('Erro ao responder proposta', 'Network error');
  });
});
