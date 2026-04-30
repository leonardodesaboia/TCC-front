import { Platform } from 'react-native';

const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL ?? '';
const WEB_USE_PROXY = process.env.EXPO_PUBLIC_WEB_USE_PROXY !== 'false';

export const API_URL = Platform.OS === 'web' && WEB_USE_PROXY ? '' : API_ORIGIN;
export const API_TIMEOUT = 15000;
export const AUTH_BYPASS_ENABLED = process.env.EXPO_PUBLIC_SKIP_AUTH === 'true';
export const USE_MOCKS_ENABLED = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';
