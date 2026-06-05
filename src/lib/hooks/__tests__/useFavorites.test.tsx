import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/integrations/client', () => ({
  clientIntegration: {
    favorites: {
      getStatus: vi.fn(),
      favorite: vi.fn(),
      unfavorite: vi.fn(),
      list: vi.fn(),
    },
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { useFavoriteStatus, useToggleFavorite, useFavoriteProfessionals } from '../useFavorites';
import { clientIntegration } from '@/lib/integrations/client';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useFavoriteStatus', () => {
  it('retorna o status de favorito do profissional', async () => {
    vi.mocked(clientIntegration.favorites.getStatus).mockResolvedValue({
      professionalId: 'pro-1',
      favorite: true,
    });

    const { result } = renderHook(() => useFavoriteStatus('pro-1'), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.favorite).toBe(true);
    expect(clientIntegration.favorites.getStatus).toHaveBeenCalledWith('pro-1');
  });
});

describe('useToggleFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clientIntegration.favorites.favorite).mockResolvedValue(undefined);
    vi.mocked(clientIntegration.favorites.unfavorite).mockResolvedValue(undefined);
  });

  it('chama favorite quando isFavorited=false', async () => {
    const { result } = renderHook(() => useToggleFavorite('pro-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(false);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientIntegration.favorites.favorite).toHaveBeenCalledWith('pro-1');
    expect(clientIntegration.favorites.unfavorite).not.toHaveBeenCalled();
  });

  it('chama unfavorite quando isFavorited=true', async () => {
    const { result } = renderHook(() => useToggleFavorite('pro-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(true);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clientIntegration.favorites.unfavorite).toHaveBeenCalledWith('pro-1');
    expect(clientIntegration.favorites.favorite).not.toHaveBeenCalled();
  });

  it('mostra toast de erro quando a mutation falha', async () => {
    vi.mocked(clientIntegration.favorites.favorite).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useToggleFavorite('pro-1'), {
      wrapper: makeWrapper(),
    });

    await act(async () => {
      result.current.mutate(false);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const { toast } = await import('@/lib/utils/toast');
    expect(toast.error).toHaveBeenCalledWith('Não foi possível atualizar os favoritos.');
  });
});

describe('useFavoriteProfessionals', () => {
  it('retorna a lista de profissionais favoritos', async () => {
    const mockList = [{ id: 'pro-1', name: 'Carlos', rating: 4.9, reviewCount: 10, profession: 'Eletricista', professions: [], areas: [], specialties: [] }];
    vi.mocked(clientIntegration.favorites.list).mockResolvedValue(mockList as never);

    const { result } = renderHook(() => useFavoriteProfessionals(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockList);
  });
});
