import { useColorScheme } from 'react-native';

const COLORS = {
  background: '#0D0D0D',
  card: '#141414',
  primary: '#E8A830',
  primaryDim: '#C48820',
  foreground: '#F2F2F2',
  mutedForeground: '#999999',
  muted: '#1F1F1F',
  border: '#2D2516',
  danger: '#D93030',
  success: '#10B981',
  info: '#3B82F6',
  purple: '#8B5CF6',
};

// Both light and dark schemes use the same luxury dark palette
export function useColors() {
  // We always use dark mode for this app
  return COLORS;
}

export type Colors = typeof COLORS;
