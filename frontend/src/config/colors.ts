// PropManage Design Tokens
// Source: Brand Guidelines v1.0 (05_BrandGuidelines.md)

export const colors = {
  propblue: '#1B4FD8',
  propblueDark: '#0F2D7F',
  propblueLight: '#E8EDFF',
  ink: '#0D0D0D',
  inkMedium: '#2E2E2E',
  inkLight: '#6B7280',
  border: '#E5E7EB',
  surface: '#F9FAFB',
  white: '#FFFFFF',
  sage: '#16A34A',
  amber: '#D97706',
  crimson: '#DC2626',
  slate: '#64748B',
  violet: '#7C3AED',
} as const;

export const typography = {
  display: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  overline: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

export const statusColors = {
  paid: { bg: '#DCFCE7', text: '#15803D' },
  overdue: { bg: '#FEF3C7', text: '#B45309' },
  pending: { bg: '#F1F5F9', text: '#475569' },
  vacant: { bg: '#EDE9FE', text: '#6D28D9' },
  occupied: { bg: '#DCFCE7', text: '#15803D' },
} as const;
