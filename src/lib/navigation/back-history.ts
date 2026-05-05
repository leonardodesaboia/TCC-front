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
  stack.push(entry);
}

export function useTrackNavigationHistory() {
  const pathname = usePathname();
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const goBack = useGoBack();
  const segmentKey = segments.join('/');

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length < 2) return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack]);

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
    if (stack.length < 2) return;

    stack.pop();
    const previous = stack[stack.length - 1];
    router.navigate({ pathname: previous.pathname, params: previous.params } as never);
  }, [router]);
}

export function resetNavigationHistory() {
  stack.length = 0;
}
