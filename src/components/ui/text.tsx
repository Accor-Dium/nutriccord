import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { FontFamily, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const VARIANTS = StyleSheet.create({
  /** Título de pantalla (Space Grotesk 32). */
  display: { fontFamily: FontFamily.displayBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  /** Título de pantalla secundaria / modal. */
  title: { fontFamily: FontFamily.displayBold, fontSize: 24, lineHeight: 30 },
  /** Número grande (anillo, steppers). */
  numberXl: { fontFamily: FontFamily.displayBold, fontSize: 40, lineHeight: 46, letterSpacing: -0.5 },
  numberLg: { fontFamily: FontFamily.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  number: { fontFamily: FontFamily.displayBold, fontSize: 24, lineHeight: 30 },
  numberSm: { fontFamily: FontFamily.displayBold, fontSize: 18, lineHeight: 24 },
  /** Encabezado de tarjeta. */
  heading: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 22 },
  headingLg: { fontFamily: FontFamily.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20 },
  bodyMedium: { fontFamily: FontFamily.medium, fontSize: 14, lineHeight: 20 },
  bodySemibold: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20 },
  bodyBold: { fontFamily: FontFamily.bold, fontSize: 14, lineHeight: 20 },
  large: { fontFamily: FontFamily.semibold, fontSize: 15, lineHeight: 20 },
  /** Etiqueta de campo / subtítulo gris. */
  label: { fontFamily: FontFamily.semibold, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: FontFamily.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: FontFamily.regular, fontSize: 12, lineHeight: 16 },
  captionSemibold: { fontFamily: FontFamily.semibold, fontSize: 12, lineHeight: 16 },
  /** Etiqueta en mayúsculas (META, COMIDO…). */
  overline: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tab: { fontFamily: FontFamily.semibold, fontSize: 11, lineHeight: 14 },
  button: { fontFamily: FontFamily.bold, fontSize: 16, lineHeight: 20 },
});

export type TextVariant = keyof typeof VARIANTS;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: ThemeColor;
};

export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const theme = useTheme();
  return <RNText style={[VARIANTS[variant], { color: theme[color] }, style]} {...rest} />;
}
