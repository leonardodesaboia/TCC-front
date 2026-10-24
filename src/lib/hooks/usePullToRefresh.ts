import { useState } from 'react';

interface RefetchableQuery {
  refetch: () => Promise<unknown>;
}

/**
 * Estado do "puxar para atualizar". O indicador fica ligado só durante o gesto:
 * usar isFetching mostraria o spinner também nas atualizações automáticas (polling).
 */
export function usePullToRefresh(...queries: RefetchableQuery[]) {
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all(queries.map((query) => query.refetch()));
    } finally {
      setRefreshing(false);
    }
  }

  return { refreshing, onRefresh };
}
