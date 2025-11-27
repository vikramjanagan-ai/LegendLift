import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS, TEXT_STYLES } from '../../constants/theme';

const GradientButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  variant = 'primary', // primary, secondary, success, warning, error
  size = 'medium', // small, medium, large
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return COLORS.gradientSecondary;
      case 'success':
        return COLORS.gradientSuccess;
      case 'warning':
        return COLORS.gradientWarning;
      case 'error':
        return COLORS.gradientError;
      case 'dark':
        return COLORS.gradientDark;
      default:
        return COLORS.gradientButton;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: SIZES.buttonHeightSM,
          paddingHorizontal: SIZES.paddingMD,
        };
      case 'large':
        return {
          height: SIZES.buttonHeightLG,
          paddingHorizontal: SIZES.paddingXL,
        };
      default:
        return {
          height: SIZES.buttonHeight,
          paddingHorizontal: SIZES.paddingLG,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, getSizeStyles()]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={SIZES.iconSM} color={COLORS.white} style={styles.iconLeft} />
            )}
            <Text style={[styles.text, TEXT_STYLES.button, textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={SIZES.iconSM} color={COLORS.white} style={styles.iconRight} />
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radiusButton,
    overflow: 'hidden',
    ...SHADOWS.button,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusButton,
  },
  text: {
    color: COLORS.white,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SIZES.sm,
  },
  iconRight: {
    marginLeft: SIZES.sm,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default GradientButton;
