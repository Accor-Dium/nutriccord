/**
 * Tokens de diseño de Nutriccord (lienzo "Nutriccord App").
 * Modo claro = diseño original; modo oscuro = equivalente con el mismo contraste.
 */

export const Colors = {
  light: {
    background: '#F5F6F2',
    surface: '#FFFFFF',
    surfaceMuted: '#F0F2EC',
    text: '#15201A',
    textSecondary: '#5B665F',
    textMuted: '#9AA39C',
    border: '#E3E6DF',
    divider: '#EEF0EA',
    dashed: '#C9CFC5',
    primary: '#1A6B43',
    primaryStrong: '#124D30',
    primarySoft: '#E3F1E8',
    primaryMuted: '#9CCAB0',
    onPrimary: '#FFFFFF',
    activity: '#A84A0C',
    activityStrong: '#7A3608',
    activitySoft: '#FBEBDD',
    activityBar: '#E8935A',
    protein: '#2C5BC7',
    proteinStrong: '#1E418F',
    proteinSoft: '#E6ECF8',
    carbs: '#B07A12',
    carbsStrong: '#6B4600',
    carbsSoft: '#F5ECD9',
    fat: '#A23A78',
    fatStrong: '#7E2A5C',
    fatSoft: '#F5E4EE',
    over: '#B07A12',
    overText: '#8A5A00',
    danger: '#B42318',
    shadow: 'rgba(21,32,26,0.15)',
  },
  dark: {
    background: '#0E1410',
    surface: '#18211B',
    surfaceMuted: '#222C25',
    text: '#EDF2EE',
    textSecondary: '#A6B1A9',
    textMuted: '#6F7A72',
    border: '#2A352D',
    divider: '#232D26',
    dashed: '#3A463D',
    primary: '#2E8A5A',
    primaryStrong: '#7FD1A3',
    primarySoft: '#1C3326',
    primaryMuted: '#3E6B52',
    onPrimary: '#FFFFFF',
    activity: '#C2611F',
    activityStrong: '#F2B486',
    activitySoft: '#3A2416',
    activityBar: '#C2611F',
    protein: '#6E93E8',
    proteinStrong: '#A9C0F4',
    proteinSoft: '#1D2840',
    carbs: '#D9A33A',
    carbsStrong: '#EBCB8B',
    carbsSoft: '#352B16',
    fat: '#D673AE',
    fatStrong: '#EDB3D5',
    fatSoft: '#36202E',
    over: '#D9A33A',
    overText: '#EBCB8B',
    danger: '#F97066',
    shadow: 'rgba(0,0,0,0.4)',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof ThemeColors;

/** Familias cargadas con @expo-google-fonts (ver _layout.tsx). */
export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  displaySemibold: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  eight: 32,
} as const;

export const Radius = {
  sm: 9,
  md: 12,
  lg: 14,
  xl: 16,
  card: 20,
  pill: 999,
} as const;

/** Alto de la barra de pestañas (sin el inset inferior del sistema). */
export const TabBarHeight = 64;
export const MaxContentWidth = 560;
