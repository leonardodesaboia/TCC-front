import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function deleteStoredValue(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }

  if (typeof SecureStore.deleteItemAsync === 'function') {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  const legacyModule = SecureStore as typeof SecureStore & {
    deleteValueWithKeyAsync?: (key: string) => Promise<void>;
  };

  if (typeof legacyModule.deleteValueWithKeyAsync === 'function') {
    await legacyModule.deleteValueWithKeyAsync(key);
  }
}

export async function clearStoredTokens(): Promise<void> {
  await Promise.all([
    deleteStoredValue(ACCESS_TOKEN_KEY),
    deleteStoredValue(REFRESH_TOKEN_KEY),
  ]);
}
