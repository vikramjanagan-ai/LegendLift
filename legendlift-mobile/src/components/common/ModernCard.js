import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const ModernCard = ({
  children,
  onPress,
  variant = 'default', // default, summary, highlight, warning
  elevation = 'medium', // none, small, medium, large
  style,
  padding = SIZES.cardPadding,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'summary':
        return COLORS.cardSummary;
      case 'highlight':
        return COLORS.cardHighlight;
      case 'warning':
        return COLORS.cardWarning;
      default:
        return COLORS.cardBackground;
    }
  };

  const getShadowStyle = () => {
    switch (elevation) {
      case 'none':
        return SHADOWS.none;
      case 'small':
        return SHADOWS.small;
      case 'large':
        return SHADOWS.large;
      case 'card':
        return SHADOWS.card;
      default:
        return SHADOWS.medium;
    }
  };

  const cardStyles = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      padding: padding,
    },
    getShadowStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radiusCard,
    marginBottom: SIZES.cardMargin,
  },
});

export default ModernCard;
