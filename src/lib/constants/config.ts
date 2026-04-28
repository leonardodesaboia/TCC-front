import { Platform } from 'react-native';

const DEFAULT_API_ORIGIN = process.env.EXPO_PUBLIC_API_PROXY_TARGET || 'http://localhost:8080';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' ? '' : DEFAULT_API_ORIGIN);
export const API_TIMEOUT = 15000;
export const AUTH_BYPASS_ENABLED = process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';
export const USE_MOCKS_ENABLED = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
