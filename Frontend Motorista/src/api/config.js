import { NativeModules, Platform } from 'react-native';

const DEFAULT_PORT = process.env.EXPO_PUBLIC_API_PORT || '8000';
const DEFAULT_PROTOCOL = process.env.EXPO_PUBLIC_API_PROTOCOL || 'http';
const DEFAULT_HOST = Platform.select({
  android: '10.0.2.2',
  ios: '127.0.0.1',
  default: '127.0.0.1',
});

function getHostFromMetroBundle() {
  const scriptURL = NativeModules?.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/(?:https?|exp):\/\/([^/:]+)(?::\d+)?/i);
  return match?.[1] || null;
}

const BASE_HOST =
  process.env.EXPO_PUBLIC_API_HOST ||
  getHostFromMetroBundle() ||
  DEFAULT_HOST;

const WS_PROTOCOL = DEFAULT_PROTOCOL === 'https' ? 'wss' : 'ws';

export const API_BASE_URL = ${DEFAULT_PROTOCOL}://${BASE_HOST}:${DEFAULT_PORT}/api/v1;
export const WS_BASE_URL = ${WS_PROTOCOL}://${BASE_HOST}:${DEFAULT_PORT}/api/v1;