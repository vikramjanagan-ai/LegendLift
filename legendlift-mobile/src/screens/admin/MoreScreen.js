import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Header, Card } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { logout } from '../../store/slices/authSlice';

const MoreScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => dispatch(logout()), style: 'destructive' },
      ]
    );
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: 'person-outline', title: 'Profile Settings', onPress: () => Alert.alert('Coming Soon', 'Profile settings will be available soon') },
        { icon: 'key-outline', title: 'Change Password', onPress: () => Alert.alert('Coming Soon', 'Change password will be available soon') },
      ]
    },
    {
      section: 'Management',
      items: [
        { icon: 'people-outline', title: 'Manage Technicians', onPress: () => navigation.navigate('Technicians') },
        { icon: 'business-outline', title: 'Company Settings', onPress: () => Alert.alert('Coming Soon', 'Company settings will be available soon') },
        { icon: 'notifications-outline', title: 'Notifications', onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon') },
      ]
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => Alert.alert('Help', 'For support, contact: support@legendlift.com') },
        { icon: 'information-circle-outline', title: 'About', onPress: () => Alert.alert('LegendLift', 'Version 1.0.0\n\nElevator AMC Management System') },
      ]
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="More" showBack={false} />
      <ScrollView style={styles.content}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={32} color={COLORS.white} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'admin@legendlift.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Administrator</Text>
            </View>
          </View>
        </Card>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <Card>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuIconContainer}>
                      <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuText}>{item.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.grey400} />
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginLG,
    padding: SIZES.paddingLG,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.marginMD,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.marginSM,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: SIZES.caption,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SIZES.marginLG,
  },
  sectionTitle: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.marginSM,
    marginLeft: SIZES.marginXS,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMD,
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: SIZES.marginMD,
  },
  menuText: {
    flex: 1,
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingMD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.marginMD,
    marginBottom: SIZES.marginLG,
    ...SHADOWS.small,
  },
  logoutText: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SIZES.marginSM,
  },
  versionText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.marginXL,
  },
});

export default MoreScreen;
