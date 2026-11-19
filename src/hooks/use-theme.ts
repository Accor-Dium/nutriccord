/**
 * Paleta activa según el modo claro/oscuro del sistema.
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
