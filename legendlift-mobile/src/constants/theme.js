// Modern Purple Gradient Theme - Inspired by Trading App Design

export const COLORS = {
  // Primary Purple Gradient Palette (Main Theme)
  primary: '#7C3AED',           // Purple 600
  primaryDark: '#6D28D9',       // Purple 700
  primaryLight: '#A78BFA',      // Purple 400
  primaryExtraLight: '#EDE9FE', // Purple 100
  primaryGhost: '#F5F3FF',      // Purple 50

  // Secondary Teal/Cyan Palette (Accents)
  secondary: '#14B8A6',         // Teal 500
  secondaryDark: '#0D9488',     // Teal 600
  secondaryLight: '#5EEAD4',    // Teal 300
  secondaryExtraLight: '#CCFBF1', // Teal 100

  // Accent Colors
  accent: '#8B5CF6',            // Violet 500
  accentDark: '#7C3AED',        // Violet 600
  accentLight: '#A78BFA',       // Violet 400

  // Status Colors - Vibrant & Modern
  success: '#10B981',           // Emerald 500
  successLight: '#6EE7B7',      // Emerald 300
  successDark: '#059669',       // Emerald 600

  warning: '#F59E0B',           // Amber 500
  warningLight: '#FCD34D',      // Amber 300
  warningDark: '#D97706',       // Amber 600

  error: '#EF4444',             // Red 500
  errorLight: '#FCA5A5',        // Red 300
  errorDark: '#DC2626',         // Red 600

  info: '#3B82F6',              // Blue 500
  infoLight: '#93C5FD',         // Blue 300
  infoDark: '#2563EB',          // Blue 600

  // Service Status Colors
  pending: '#F59E0B',           // Amber
  completed: '#10B981',         // Emerald
  overdue: '#EF4444',           // Red
  scheduled: '#3B82F6',         // Blue
  inProgress: '#8B5CF6',        // Violet
  cancelled: '#6B7280',         // Gray

  // AMC Status Colors
  active: '#10B981',            // Emerald
  warranty: '#3B82F6',          // Blue
  renewal: '#F59E0B',           // Amber
  closed: '#9CA3AF',            // Gray
  expired: '#EF4444',           // Red

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Modern Grey Scale (Tailwind inspired)
  grey50: '#F9FAFB',
  grey100: '#F3F4F6',
  grey200: '#E5E7EB',
  grey300: '#D1D5DB',
  grey400: '#9CA3AF',
  grey500: '#6B7280',
  grey600: '#4B5563',
  grey700: '#374151',
  grey800: '#1F2937',
  grey900: '#111827',

  // Text Colors - Improved contrast for better readability
  textPrimary: '#111827',       // Grey 900 - Dark text
  textSecondary: '#374151',     // Grey 700 - Much darker for better visibility
  textTertiary: '#4B5563',      // Grey 600 - Darker tertiary text
  textDisabled: '#9CA3AF',      // Grey 400 - Still light for disabled
  textWhite: '#FFFFFF',
  textPurple: '#7C3AED',        // Purple 600
  textTeal: '#14B8A6',          // Teal 500

  // Background Colors - Modern & Clean
  background: '#5A67D8',        // Indigo/Purple background (like reference image)
  backgroundGradientStart: '#7C3AED',  // Purple gradient start
  backgroundGradientEnd: '#5A67D8',    // Purple gradient end
  backgroundWhite: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundLight: '#F9FAFB',   // Grey 50
  backgroundDark: '#1F2937',    // Grey 800
  backgroundMuted: '#F3F4F6',   // Grey 100
  backgroundHighlight: '#EDE9FE', // Purple 100
  backgroundOverlay: 'rgba(124, 58, 237, 0.05)', // Light purple overlay

  // Card Specific
  cardBackground: '#FFFFFF',
  cardSummary: '#E0F2FE',       // Light blue (like summary box in reference)
  cardHighlight: '#F0FDF4',     // Light green
  cardWarning: '#FEF3C7',       // Light amber

  // Border Colors
  border: '#E5E7EB',            // Grey 200
  borderLight: '#F3F4F6',       // Grey 100
  borderMedium: '#D1D5DB',      // Grey 300
  borderDark: '#9CA3AF',        // Grey 400
  borderFocus: '#7C3AED',       // Purple 600
  borderPurple: '#A78BFA',      // Purple 400

  // Overlay & Shadow
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayPurple: 'rgba(124, 58, 237, 0.1)',

  // Gradient Arrays (for LinearGradient)
  gradientPrimary: ['#7C3AED', '#A78BFA'],       // Purple gradient
  gradientSecondary: ['#14B8A6', '#5EEAD4'],     // Teal gradient
  gradientSuccess: ['#10B981', '#6EE7B7'],       // Green gradient
  gradientWarning: ['#F59E0B', '#FCD34D'],       // Amber gradient
  gradientError: ['#EF4444', '#FCA5A5'],         // Red gradient
  gradientDark: ['#6D28D9', '#7C3AED'],          // Dark purple gradient
  gradientBackground: ['#5A67D8', '#7C3AED'],    // Background gradient
  gradientButton: ['#8B5CF6', '#7C3AED'],        // Button gradient
  gradientCard: ['#FFFFFF', '#F9FAFB'],          // Card subtle gradient

  // Chart Colors (for analytics)
  chartPrimary: '#7C3AED',
  chartSecondary: '#14B8A6',
  chartTertiary: '#F59E0B',
  chartLine: '#8B5CF6',
  chartFill: 'rgba(124, 58, 237, 0.2)',
  chartGrid: '#E5E7EB',
};

export const SIZES = {
  // Font Sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,

  title: 24,
  subtitle: 18,
  body1: 16,
  body2: 14,
  body3: 12,
  caption: 11,
  button: 16,
  input: 16,
  label: 14,

  // Spacing (8px base system)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,

  // Padding
  paddingXS: 4,
  paddingSM: 8,
  paddingMD: 16,
  paddingLG: 24,
  paddingXL: 32,

  // Margin
  marginXS: 4,
  marginSM: 8,
  marginMD: 16,
  marginLG: 24,
  marginXL: 32,

  // Border Radius (More rounded - modern style)
  radiusXS: 6,
  radiusSM: 10,
  radiusMD: 16,
  radiusLG: 20,
  radiusXL: 28,
  radiusXXL: 32,
  radiusFull: 9999,
  radiusCard: 24,        // Large rounded cards like reference
  radiusButton: 12,      // Pill-shaped buttons

  // Icon Sizes
  iconXS: 16,
  iconSM: 20,
  iconMD: 24,
  iconLG: 32,
  iconXL: 40,
  iconXXL: 48,

  // Button Sizes
  buttonHeight: 52,      // Larger, more modern
  buttonHeightSM: 40,
  buttonHeightLG: 60,
  buttonRadius: 26,      // Fully rounded pill

  // Input Sizes
  inputHeight: 52,       // Larger inputs
  inputHeightSM: 40,
  inputHeightLG: 60,
  inputRadius: 26,       // Fully rounded

  // Card Sizes
  cardPadding: 20,
  cardRadius: 24,        // Large rounded corners
  cardMargin: 16,
  cardElevation: 4,

  // Screen Padding
  screenPadding: 20,
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,
};

export const FONTS = {
  // Font Families
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',

  // Font Weights
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Text Styles - Prevents text clipping on Android
export const TEXT_STYLES = {
  h1: {
    fontSize: SIZES.h1,
    fontWeight: FONTS.weight.bold,
    lineHeight: SIZES.h1 * 1.3,
    color: COLORS.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h2: {
    fontSize: SIZES.h2,
    fontWeight: FONTS.weight.bold,
    lineHeight: SIZES.h2 * 1.3,
    color: COLORS.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h3: {
    fontSize: SIZES.h3,
    fontWeight: FONTS.weight.semibold,
    lineHeight: SIZES.h3 * 1.3,
    color: COLORS.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h4: {
    fontSize: SIZES.h4,
    fontWeight: FONTS.weight.semibold,
    lineHeight: SIZES.h4 * 1.3,
    color: COLORS.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: FONTS.weight.bold,
    lineHeight: SIZES.title * 1.3,
    color: COLORS.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    fontWeight: FONTS.weight.medium,
    lineHeight: SIZES.subtitle * 1.3,
    color: COLORS.textSecondary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  body1: {
    fontSize: SIZES.body1,
    fontWeight: FONTS.weight.regular,
    lineHeight: SIZES.body1 * 1.5,
    color: COLORS.textPrimary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  body2: {
    fontSize: SIZES.body2,
    fontWeight: FONTS.weight.regular,
    lineHeight: SIZES.body2 * 1.5,
    color: COLORS.textSecondary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  caption: {
    fontSize: SIZES.caption,
    fontWeight: FONTS.weight.regular,
    lineHeight: SIZES.caption * 1.4,
    color: COLORS.textTertiary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  button: {
    fontSize: SIZES.button,
    fontWeight: FONTS.weight.semibold,
    lineHeight: SIZES.button * 1.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  label: {
    fontSize: SIZES.label,
    fontWeight: FONTS.weight.medium,
    lineHeight: SIZES.label * 1.3,
    color: COLORS.textSecondary,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xlarge: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
};

export const LAYOUT = {
  // Screen Padding
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,

  // Container
  containerMaxWidth: 1200,
  containerPadding: 20,

  // Header
  headerHeight: 64,
  headerPadding: 20,

  // Tab Bar
  tabBarHeight: 64,
  tabBarRadius: 24,

  // Card
  cardSpacing: 16,
  cardPadding: 20,
  cardRadius: 24,
  cardMargin: 16,

  // List
  listItemHeight: 72,
  listItemPadding: 16,
  listItemSpacing: 12,

  // Bottom Sheet
  bottomSheetRadius: 24,
  bottomSheetPadding: 20,
};

export const ANIMATIONS = {
  // Duration (ms)
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 700,

  // Spring Config
  spring: {
    damping: 15,
    mass: 1,
    stiffness: 150,
  },

  // Timing Functions
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
};

// Combined Theme Object
export const THEME = {
  colors: COLORS,
  sizes: SIZES,
  fonts: FONTS,
  textStyles: TEXT_STYLES,
  shadows: SHADOWS,
  layout: LAYOUT,
  animations: ANIMATIONS,
};

export default THEME;
