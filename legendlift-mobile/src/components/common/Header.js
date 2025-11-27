import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, LAYOUT } from '../../constants/theme';

const Header = ({
  title,
  subtitle,
  leftIcon = 'arrow-back',
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor = COLORS.primary,
  textColor = COLORS.white,
  showBack = true,
}) => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
        <View style={[styles.container, { backgroundColor }]}>
          <View style={styles.leftContainer}>
            {showBack && onLeftPress && (
              <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
                <Ionicons name={leftIcon} size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.centerContainer}>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          <View style={styles.rightContainer}>
            {rightIcon && onRightPress && (
              <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                <Ionicons name={rightIcon} size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingMD,
    paddingVertical: 18,
    minHeight: 70,
  },
  leftContainer: {
    width: 40,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    padding: SIZES.paddingSM,
  },
  title: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    lineHeight: SIZES.h5 * 1.3,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: SIZES.caption,
    marginTop: 4,
    lineHeight: SIZES.caption * 1.3,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default Header;
