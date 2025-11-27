import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const Card = ({
  children,
  style,
  onPress,
  padding = true,
  shadow = true,
  borderColor,
  backgroundColor = COLORS.backgroundCard,
}) => {
  const cardStyle = [
    styles.card,
    shadow && SHADOWS.card,
    padding && styles.cardPadding,
    { backgroundColor },
    borderColor && { borderWidth: 1, borderColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.radiusMD,
    overflow: 'hidden',
  },
  cardPadding: {
    padding: SIZES.cardPadding,
  },
});

export default Card;
