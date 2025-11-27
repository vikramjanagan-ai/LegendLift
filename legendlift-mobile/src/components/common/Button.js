import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    // Size styles
    if (size === 'small') baseStyle.push(styles.buttonSmall);
    if (size === 'large') baseStyle.push(styles.buttonLarge);

    // Variant styles
    if (variant === 'primary') baseStyle.push(styles.buttonPrimary);
    if (variant === 'secondary') baseStyle.push(styles.buttonSecondary);
    if (variant === 'outline') baseStyle.push(styles.buttonOutline);
    if (variant === 'danger') baseStyle.push(styles.buttonDanger);

    // State styles
    if (disabled) baseStyle.push(styles.buttonDisabled);
    if (fullWidth) baseStyle.push(styles.buttonFullWidth);

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];

    if (size === 'small') baseStyle.push(styles.buttonTextSmall);
    if (size === 'large') baseStyle.push(styles.buttonTextLarge);

    if (variant === 'outline') baseStyle.push(styles.buttonTextOutline);
    if (disabled) baseStyle.push(styles.buttonTextDisabled);

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.paddingLG,
    paddingVertical: SIZES.paddingMD,
    borderRadius: SIZES.radiusMD,
    height: SIZES.buttonHeight,
    ...SHADOWS.small,
  },
  buttonSmall: {
    height: SIZES.buttonHeightSM,
    paddingHorizontal: SIZES.paddingMD,
    paddingVertical: SIZES.paddingSM,
  },
  buttonLarge: {
    height: SIZES.buttonHeightLG,
    paddingHorizontal: SIZES.paddingXL,
    paddingVertical: SIZES.paddingLG,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.accent,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonDanger: {
    backgroundColor: COLORS.error,
  },
  buttonDisabled: {
    backgroundColor: COLORS.grey400,
    opacity: 0.6,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonText: {
    fontSize: SIZES.button,
    fontWeight: '600',
    color: COLORS.white,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  buttonTextSmall: {
    fontSize: SIZES.body2,
  },
  buttonTextLarge: {
    fontSize: SIZES.h6,
  },
  buttonTextOutline: {
    color: COLORS.primary,
  },
  buttonTextDisabled: {
    color: COLORS.grey600,
  },
});

export default Button;
