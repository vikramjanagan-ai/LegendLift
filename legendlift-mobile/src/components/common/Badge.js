import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const Badge = ({ text, variant = 'default', size = 'medium', style }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return COLORS.success;
      case 'warning':
        return COLORS.warning;
      case 'error':
        return COLORS.error;
      case 'info':
        return COLORS.info;
      case 'active':
        return COLORS.active;
      case 'pending':
        return COLORS.pending;
      case 'completed':
        return COLORS.completed;
      case 'overdue':
        return COLORS.overdue;
      default:
        return COLORS.grey500;
    }
  };

  const badgeStyle = [
    styles.badge,
    { backgroundColor: getBackgroundColor() },
    size === 'small' && styles.badgeSmall,
    size === 'large' && styles.badgeLarge,
    style,
  ];

  const textStyle = [
    styles.badgeText,
    size === 'small' && styles.badgeTextSmall,
    size === 'large' && styles.badgeTextLarge,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SIZES.paddingMD,
    paddingVertical: SIZES.paddingSM,
    borderRadius: SIZES.radiusFull,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: SIZES.paddingSM,
    paddingVertical: SIZES.paddingXS,
  },
  badgeLarge: {
    paddingHorizontal: SIZES.paddingLG,
    paddingVertical: SIZES.paddingMD,
  },
  badgeText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  badgeTextSmall: {
    fontSize: 10,
  },
  badgeTextLarge: {
    fontSize: SIZES.body2,
  },
});

export default Badge;
