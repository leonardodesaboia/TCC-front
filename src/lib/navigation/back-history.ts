import { useCallback, useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useGlobalSearchParams, usePathname, useRouter, useSegments } from 'expo-router';

interface HistoryEntry {
  pathname: string;
  segmentKey: string;
  params: Record<string, string | string[]>;
}

const stack: HistoryEntry[] = [];

function pushOrUpdate(entry: HistoryEntry) {
  const last = stack[stack.length - 1];
  if (last && last.segmentKey === entry.segmentKey) {
    stack[stack.length - 1] = entry;
    return;
  }

  // Chegar na tela anterior por outro caminho (router.back() depois de salvar um formulário,
  // replace do chat para o pedido) é uma volta: sem isto a tela que ficou para trás era empilhada
  // de novo e o botão de voltar reabria o formulário já salvo.
  const previous = stack[stack.length - 2];
  if (previous && previous.pathname === entry.pathname) {
    stack.pop();
    stack[stack.length - 1] = entry;
    return;
  }

  stack.push(entry);
}

export function useTrackNavigationHistory() {
  const pathname = usePathname();
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const goBack = useGoBack();
  const segmentKey = segments.join('/');

  // O Android chama primeiro o último listener registrado. O do React Navigation é registrado
  // ao montar o app e, quando ele abre já logado, fica na frente deste: o voltar do celular
  // seguia a pilha da aba em vez de voltar para a tela/aba anterior. Registrar de novo a cada
  // troca de tela mantém este listener sempre na frente.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length < 2) return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack, pathname]);

  useEffect(() => {
    if (!pathname || !segmentKey) return;
    pushOrUpdate({
      pathname,
      segmentKey,
      params: { ...(params as Record<string, string | string[]>) },
    });
  }, [pathname, segmentKey, params]);
}

export function useGoBack() {
  const router = useRouter();

  return useCallback(() => {
    if (stack.length < 2) {
      // Tela aberta direto (ex.: pela notificação) ainda não tem histórico próprio.
      if (router.canGoBack()) router.back();
      return;
    }

    stack.pop();
    const previous = stack[stack.length - 1];
    router.navigate({ pathname: previous.pathname, params: previous.params } as never);
  }, [router]);
}

/**
 * Tira a tela atual do histórico antes de sair dela: o voltar da próxima tela
 * não deve reabrir um formulário já enviado (ex.: criar pedido → detalhes do pedido).
 */
export function forgetCurrentRoute() {
  stack.pop();
}

export function resetNavigationHistory() {
  stack.length = 0;
}
