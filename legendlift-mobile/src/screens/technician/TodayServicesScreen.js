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
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card, Badge } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const TodayServicesScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/technician/my-services/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'pending';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Today's Services"
          showBack={false}
          rightIcon="add-circle"
          onRightPress={() => navigation.navigate('AddService')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Today's Services"
        showBack={false}
        rightIcon="add-circle"
        onRightPress={() => navigation.navigate('AddService')}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>
              {services.filter((s) => s.status === 'in_progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.pending }]}>
              {services.filter((s) => s.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Services List */}
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.grey400} />
            <Text style={styles.emptyText}>No services for today</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddService')}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add New Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((service) => (
            <Card
              key={service.id}
              style={styles.serviceCard}
              onPress={() =>
                navigation.navigate('ServiceDetail', { serviceId: service.id })
              }
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceId}>{service.service_id}</Text>
                  <Text style={styles.serviceName}>{service.customer_name}</Text>
                  <View style={styles.serviceLocation}>
                    <Ionicons
                      name="location"
                      size={14}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.serviceLocationText}>
                      {service.customer_location}
                    </Text>
                  </View>
                </View>
                <Badge
                  text={service.status}
                  variant={getStatusColor(service.status)}
                  size="small"
                />
              </View>

              <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>
                    {service.service_type.charAt(0).toUpperCase() +
                      service.service_type.slice(1)}
                  </Text>
                </View>
                {service.scheduled_date && (
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>
                      {new Date(service.scheduled_date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>

              {service.notes && (
                <Text style={styles.serviceNotes} numberOfLines={2}>
                  {service.notes}
                </Text>
              )}

              <View style={styles.serviceFooter}>
                <TouchableOpacity style={styles.footerButton}>
                  <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.footerButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                  <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.footerButtonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.footerButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {services.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddService')}
        >
          <Ionicons name="add" size={32} color={COLORS.white} />
        </TouchableOpacity>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.marginLG,
    gap: SIZES.marginMD,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingMD,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    lineHeight: SIZES.h3 * 1.3,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    lineHeight: SIZES.caption * 1.3,
    includeFontPadding: false,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.paddingXL * 2,
  },
  emptyText: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    marginTop: SIZES.marginMD,
    marginBottom: SIZES.marginLG,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingMD,
    paddingHorizontal: SIZES.paddingLG,
    alignItems: 'center',
    gap: SIZES.marginSM,
  },
  addButtonText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: SIZES.body2 * 1.2,
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
  serviceId: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
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
  serviceDetails: {
    flexDirection: 'row',
    gap: SIZES.marginLG,
    marginBottom: SIZES.marginSM,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  serviceNotes: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SIZES.marginMD,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  serviceFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.grey200,
    paddingTop: SIZES.paddingMD,
    gap: SIZES.marginSM,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footerButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  fab: {
    position: 'absolute',
    right: SIZES.paddingLG,
    bottom: SIZES.paddingLG + 60, // Account for tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
});

export default TodayServicesScreen;
