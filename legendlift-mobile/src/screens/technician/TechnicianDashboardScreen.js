import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Header, Badge } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { logout } from '../../store/slices/authSlice';
import { API_CONFIG } from '../../constants';

const TechnicianDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayServices: 0,
    completedToday: 0,
    pendingServices: 0,
    totalCompleted: 0,
    averageRating: 0,
  });
  const [todayServices, setTodayServices] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      // Fetch today's services
      const servicesRes = await fetch(`${API_CONFIG.BASE_URL}/technician/my-services/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (servicesRes.ok) {
        const services = await servicesRes.json();
        setTodayServices(services.slice(0, 3)); // Show only first 3

        // Calculate stats from services
        const todayCount = services.length;
        const completedToday = services.filter(s => s.status === 'COMPLETED').length;
        const pendingCount = services.filter(s => s.status === 'PENDING' || s.status === 'SCHEDULED').length;

        // Fetch all technician's services for total completed
        const allServicesRes = await fetch(`${API_CONFIG.BASE_URL}/technician/service-history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        let totalCompleted = 0;
        if (allServicesRes.ok) {
          const allServices = await allServicesRes.json();
          totalCompleted = allServices.filter(s => s.status === 'COMPLETED').length;
        }

        setStats({
          todayServices: todayCount,
          completedToday: completedToday,
          pendingServices: pendingCount,
          totalCompleted: totalCompleted,
          averageRating: 4.5, // Will be calculated from service reports
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle={`Welcome, ${user?.name || 'Technician'}`}
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Today's Services"
              value={stats.todayServices}
              icon="calendar"
              color={COLORS.primary}
              flex={1}
              onPress={() => navigation.navigate('Services')}
            />
            <StatCard
              title="Completed"
              value={stats.completedToday}
              icon="checkmark-circle"
              color={COLORS.completed}
              flex={1}
              onPress={() => navigation.navigate('History')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Pending"
              value={stats.pendingServices}
              icon="time"
              color={COLORS.pending}
              flex={1}
              onPress={() => navigation.navigate('Services')}
            />
            <StatCard
              title="Total Completed"
              value={stats.totalCompleted}
              icon="trophy"
              color={COLORS.success}
              flex={1}
              onPress={() => navigation.navigate('History')}
            />
          </View>
        </View>

        {/* Rating Card */}
        <Card style={styles.ratingCard}>
          <View style={styles.ratingContent}>
            <View style={styles.ratingIcon}>
              <Ionicons name="star" size={32} color={COLORS.warning} />
            </View>
            <View style={styles.ratingInfo}>
              <Text style={styles.ratingValue}>{stats.averageRating}</Text>
              <Text style={styles.ratingLabel}>Average Rating</Text>
            </View>
          </View>
        </Card>

        {/* Today's Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Services')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayServices.length > 0 ? (
            todayServices.map((service) => (
              <ServiceCard key={service.id} service={service} navigation={navigation} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No services scheduled for today</Text>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.createServiceButton}
            onPress={() => navigation.navigate('AddService')}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.white} />
            <Text style={styles.createServiceText}>Create New Service</Text>
          </TouchableOpacity>
          <View style={styles.actionsRow}>
            <ActionButton
              title="My Services"
              icon="calendar"
              color={COLORS.primary}
              onPress={() => navigation.navigate('Services')}
            />
            <ActionButton
              title="Service History"
              icon="time"
              color={COLORS.accent}
              onPress={() => navigation.navigate('History')}
            />
          </View>
        </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const StatCard = ({ title, value, icon, color, flex, onPress }) => (
  <Card style={[styles.statCard, { flex }]} onPress={onPress}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Card>
);

const ServiceCard = ({ service, navigation }) => {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'completed';
      case 'in_progress':
        return 'info';
      case 'pending':
      case 'scheduled':
        return 'pending';
      default:
        return 'default';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card style={styles.serviceCard} onPress={() => navigation?.navigate('ServiceDetail', { serviceId: service.id })}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.customer_name}</Text>
          <View style={styles.serviceLocation}>
            <Ionicons name="location" size={14} color={COLORS.textSecondary} />
            <Text style={styles.serviceLocationText}>{service.customer_location || service.area}</Text>
          </View>
        </View>
        <Badge text={service.status} variant={getStatusColor(service.status)} size="small" />
      </View>
      <View style={styles.serviceFooter}>
        <View style={styles.serviceTime}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
          <Text style={styles.serviceTimeText}>{formatTime(service.scheduled_date)}</Text>
        </View>
        <TouchableOpacity style={styles.navigateButton}>
          <Ionicons name="navigate" size={16} color={COLORS.primary} />
          <Text style={styles.navigateText}>Navigate</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const ActionButton = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color={COLORS.white} />
    </View>
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

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
  emptyCard: {
    padding: SIZES.paddingLG,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  statsContainer: {
    marginBottom: SIZES.marginLG,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.marginMD,
    marginBottom: SIZES.marginMD,
  },
  statCard: {
    alignItems: 'center',
    padding: SIZES.paddingMD,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.marginSM,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: SIZES.h3 * 1.3,
    includeFontPadding: false,
  },
  statTitle: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: SIZES.caption * 1.3,
    includeFontPadding: false,
  },
  ratingCard: {
    marginBottom: SIZES.marginLG,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.marginMD,
  },
  ratingInfo: {
    flex: 1,
  },
  ratingValue: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: SIZES.h2 * 1.3,
    includeFontPadding: false,
  },
  ratingLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  section: {
    marginBottom: SIZES.marginLG,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.marginMD,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginMD,
    lineHeight: SIZES.h5 * 1.3,
    includeFontPadding: false,
  },
  createServiceButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingLG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.marginMD,
    ...SHADOWS.medium,
  },
  createServiceText: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SIZES.marginSM,
    lineHeight: SIZES.h6 * 1.2,
    includeFontPadding: false,
  },
  sectionLink: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  serviceCard: {
    marginBottom: SIZES.marginMD,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginMD,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  serviceLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceLocationText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceTimeText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navigateText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SIZES.marginMD,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingLG,
    alignItems: 'center',
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
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
});

export default TechnicianDashboardScreen;
