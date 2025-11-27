import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/common';
import { COLORS, SIZES } from '../../constants/theme';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Header title="Profile" showBack={false} />
      <ScrollView style={styles.content}>
        <Text style={styles.text}>Profile Screen - Coming Soon</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.paddingMD,
  },
  text: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.marginXL,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
});

export default ProfileScreen;
