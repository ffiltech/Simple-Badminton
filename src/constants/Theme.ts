import { TextStyle } from 'react-native';

export const Colors = {
  // Backgrounds
  background: '#0F172A', // Deep slate blue-black
  surface: '#1E293B',    // Slate blue surface
  surfaceLight: '#334155',

  // Accents
  primary: '#10B981',    // Emerald Green (Badminton court feel)
  primaryLight: '#34D399',
  secondary: '#3B82F6',  // Electric Blue
  secondaryLight: '#60A5FA',

  // Status
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',

  // Text
  text: '#F8FAFC',       // Pure off-white
  textMuted: '#94A3B8',  // Muted slate
  textInverted: '#0F172A',

  // Borders
  border: '#334155',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: Colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: Colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: Colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: Colors.textMuted,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
  },
  score: {
    fontSize: 64,
    fontWeight: '800' as TextStyle['fontWeight'],
    color: Colors.text,
  },
  bold: {
    fontSize: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: Colors.text,
  }
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
};
