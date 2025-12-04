import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Card, Header } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { logout } from '../../store/slices/authSlice';
import { API_CONFIG } from '../../constants';

const CustomerDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    completedServices: 0,
    pendingComplaints: 0,
    nextServiceDate: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch customer data
      const customerRes = await fetch(`${API_CONFIG.BASE_URL}/customers/${user.customer_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch customer's services
      const servicesRes = await fetch(`${API_CONFIG.BASE_URL}/services/schedules?customer_id=${user.customer_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (customerRes.ok) {
        const data = await customerRes.json();
        setCustomerData(data);
      }

      if (servicesRes.ok) {
        const services = await servicesRes.json();

        // Filter upcoming services
        const now = new Date();
        const upcoming = services
          .filter(s => new Date(s.scheduled_date) >= now && s.status !== 'COMPLETED')
          .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
          .slice(0, 3);

        setUpcomingServices(upcoming);

        // Calculate stats
        const completed = services.filter(s => s.status === 'COMPLETED').length;
        const nextService = upcoming.length > 0 ? upcoming[0].scheduled_date : null;

        setStats({
          totalServices: services.length,
          completedServices: completed,
          pendingComplaints: 0, // Will be updated when complaints API is ready
          nextServiceDate: nextService,
        });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle={`Welcome, ${user?.name || 'Customer'}`}
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
            {/* Customer Info Card */}
            {customerData && (
              <Card style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="business" size={24} color={COLORS.primary} />
                  <Text style={styles.infoTitle}>Property Details</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Job Number:</Text>
                  <Text style={styles.infoValue}>{customerData.job_number}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <Text style={styles.infoValue}>{customerData.area}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.infoValue}>{customerData.address}</Text>
                </View>
              </Card>
            )}

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <StatCard
                  title="Total Services"
                  value={stats.totalServices}
                  icon="calendar"
                  color={COLORS.primary}
                />
                <StatCard
                  title="Completed"
                  value={stats.completedServices}
                  icon="checkmark-circle"
                  color={COLORS.completed}
                />
              </View>
            </View>

            {/* Next Service Card */}
            {stats.nextServiceDate && (
              <Card style={styles.nextServiceCard}>
                <View style={styles.nextServiceHeader}>
                  <View style={styles.nextServiceIcon}>
                    <Ionicons name="time" size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.nextServiceInfo}>
                    <Text style={styles.nextServiceLabel}>Next Service</Text>
                    <Text style={styles.nextServiceDate}>{formatDate(stats.nextServiceDate)}</Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Upcoming Services */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Services</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Services')}>
                  <Text style={styles.sectionLink}>View All</Text>
                </TouchableOpacity>
              </View>

              {upcomingServices.length > 0 ? (
                upcomingServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    formatDate={formatDate}
                    formatTime={formatTime}
                  />
                ))
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No upcoming services scheduled</Text>
                </Card>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsRow}>
                <ActionButton
                  title="My Services"
                  icon="calendar"
                  color={COLORS.primary}
                  onPress={() => navigation.navigate('Services')}
                />
                <ActionButton
                  title="Raise Complaint"
                  icon="alert-circle"
                  color={COLORS.warning}
                  onPress={() => navigation.navigate('Complaints')}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Card style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Card>
);

const ServiceCard = ({ service, formatDate, formatTime }) => (
  <Card style={styles.serviceCard}>
    <View style={styles.serviceHeader}>
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTechnician}>
          Technician: {service.technician_name || 'To be assigned'}
        </Text>
        <Text style={styles.serviceType}>{service.service_type || 'Regular Service'}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        { backgroundColor: service.status === 'SCHEDULED' ? COLORS.primary + '20' : COLORS.pending + '20' }
      ]}>
        <Text style={[
          styles.statusText,
          { color: service.status === 'SCHEDULED' ? COLORS.primary : COLORS.pending }
        ]}>
          {service.status}
        </Text>
      </View>
    </View>
    <View style={styles.serviceFooter}>
      <View style={styles.serviceDateTime}>
        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.serviceDateText}>{formatDate(service.scheduled_date)}</Text>
      </View>
      <View style={styles.serviceDateTime}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.serviceDateText}>{formatTime(service.scheduled_date)}</Text>
      </View>
    </View>
  </Card>
);

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
  infoCard: {
    marginBottom: SIZES.marginLG,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginMD,
    gap: 8,
  },
  infoTitle: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  statsContainer: {
    marginBottom: SIZES.marginLG,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.marginMD,
  },
  statCard: {
    flex: 1,
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
  },
  statTitle: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nextServiceCard: {
    marginBottom: SIZES.marginLG,
  },
  nextServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextServiceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.marginMD,
  },
  nextServiceInfo: {
    flex: 1,
  },
  nextServiceLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  nextServiceDate: {
    fontSize: SIZES.h5,
    fontWeight: '700',
    color: COLORS.primary,
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
  },
  sectionLink: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
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
  serviceTechnician: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceFooter: {
    flexDirection: 'row',
    gap: SIZES.marginMD,
  },
  serviceDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDateText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    padding: SIZES.paddingLG,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  },
});

export default CustomerDashboardScreen;
