import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Card, Header } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { logout } from '../../store/slices/authSlice';
import { API_CONFIG } from '../../constants';

const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [icons, setIcons] = useState([]);
  const [period, setPeriod] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch new dashboard/overview endpoint with 10 separate icons
      const response = await fetch(`${API_CONFIG.BASE_URL}/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIcons(data.icons || []);
        setPeriod(data.period || 'Last 30 Days');
      } else {
        console.error('Dashboard API error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const navigateToScreen = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle={`Welcome, ${user?.name || 'Admin'}`}
        showBack={false}
        rightIcon="log-out-outline"
        onRightPress={handleLogout}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            {/* Dashboard Period Info */}
            <View style={styles.section}>
              <Text style={styles.periodText}>{period}</Text>
            </View>

            {/* 10 Separate Icon Cards - Grid Layout - CLICKABLE */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metrics Overview</Text>
              <View style={styles.iconsGrid}>
                {icons.map((icon) => {
                  const screen = getNavigationScreen(icon.title);
                  return (
                    <IconCard
                      key={icon.id}
                      title={icon.title}
                      value={icon.value}
                      icon={icon.icon}
                      color={icon.color}
                      period={icon.period}
                      onPress={() => screen && navigateToScreen(screen)}
                    />
                  );
                })}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <ActionButton
                  title="View Customers"
                  icon="people"
                  color={COLORS.primary}
                  onPress={() => navigateToScreen('Customers')}
                />
                <ActionButton
                  title="View Services"
                  icon="calendar"
                  color={COLORS.accent}
                  onPress={() => navigateToScreen('Services')}
                />
                <ActionButton
                  title="View Reports"
                  icon="stats-chart"
                  color={COLORS.success}
                  onPress={() => navigateToScreen('Reports')}
                />
                <ActionButton
                  title="Manage Technicians"
                  icon="people-circle"
                  color={COLORS.warning}
                  onPress={() => navigateToScreen('Technicians')}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Map icon names to emojis
const getIconEmoji = (iconName) => {
  const emojiMap = {
    'users': '🧑‍💼',
    'user-check': '🌟',
    'briefcase': '📊',
    'check-circle': '✅',
    'phone': '📲',
    'phone-check': '💬',
    'tool': '🔧',
    'check-square': '✔️',
    'file-text': '📄',
    'file-check': '✅',
  };
  return emojiMap[iconName] || '📊';
};

// Map titles to navigation screens
const getNavigationScreen = (title) => {
  if (title.includes('Customer')) return 'Customers';
  if (title.includes('Service')) return 'Services';
  if (title.includes('Callback')) return 'Callbacks';
  if (title.includes('Repair')) return 'Repairs';
  if (title.includes('Report')) return 'Reports';
  return null;
};

// New IconCard component for 10 separate metrics - CLICKABLE
const IconCard = ({ title, value, icon, color, period, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card style={styles.iconCard}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Text style={styles.emojiIcon}>{getIconEmoji(icon)}</Text>
      </View>
      <Text style={styles.iconValue}>{value}</Text>
      <Text style={styles.iconTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.iconPeriod}>{period}</Text>
    </Card>
  </TouchableOpacity>
);

const ActionButton = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - SIZES.paddingMD * 2 - 12) / 2; // 12 is gap between cards

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.paddingMD,
  },
  loader: {
    marginTop: 50,
  },
  section: {
    marginBottom: SIZES.marginLG,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginMD,
    lineHeight: SIZES.h5 * 1.3,
    includeFontPadding: false,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconCard: {
    width: cardWidth,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emojiIcon: {
    fontSize: 28,
  },
  iconValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  iconTitle: {
    fontSize: 11,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 2,
  },
  iconPeriod: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  alertCard: {
    marginBottom: SIZES.marginMD,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.marginMD,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  alertText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMD,
  },
  metricLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  metricValue: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    lineHeight: SIZES.h5 * 1.3,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingLG,
    alignItems: 'center',
    marginBottom: SIZES.marginMD,
    ...SHADOWS.small,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.marginMD,
  },
  actionText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
});

export default AdminDashboardScreen;
