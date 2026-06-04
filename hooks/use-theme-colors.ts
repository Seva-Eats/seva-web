'use client';

import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColors() {
  const { themeMode } = useTheme();

  const resolved =
    themeMode === 'dark'
      ? 'dark'
      : themeMode === 'light'
        ? 'light'
        : typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

  return {
    ...Colors[resolved],
    isDark: resolved === 'dark',
  };
}
