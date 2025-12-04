import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Header, Card, Badge } from '../../components/common';
import { COLORS, SIZES } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const ServiceDetailScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);

  useEffect(() => {
    fetchServiceDetail();
  }, [serviceId]);

  const fetchServiceDetail = async () => {
    // For now, we'll fetch from today's services
    // In a real app, you'd have a specific endpoint for service details
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/technician/my-services/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const services = await response.json();
        const foundService = services.find(s => s.id === serviceId);
        setService(foundService);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
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

  const handleCall = () => {
    if (service?.customer_phone) {
      Linking.openURL(`tel:${service.customer_phone}`);
    }
  };

  const handleNavigate = () => {
    if (service?.customer_address) {
      const address = encodeURIComponent(service.customer_address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Service Details" showBack onLeftPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.container}>
        <Header title="Service Details" showBack onLeftPress={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.grey400} />
          <Text style={styles.emptyText}>Service not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Service Details"
        showBack
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Service ID Card */}
        <Card style={styles.serviceIdCard}>
          <View style={styles.serviceIdHeader}>
            <View>
              <Text style={styles.serviceIdLabel}>Service ID</Text>
              <Text style={styles.serviceIdValue}>{service.service_id}</Text>
            </View>
            <Badge text={service.status} variant={getStatusColor(service.status)} />
          </View>
        </Card>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Card>
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Customer Name</Text>
                <Text style={styles.infoValue}>{service.customer_name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{service.customer_location}</Text>
                <Text style={styles.infoAddress}>{service.customer_address}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{service.customer_phone}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Service Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Information</Text>
          <Card>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Service Type</Text>
                <Text style={styles.infoValue}>
                  {service.service_type.charAt(0).toUpperCase() + service.service_type.slice(1)}
                </Text>
              </View>
            </View>

            {service.scheduled_date && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={20} color={COLORS.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Scheduled Date</Text>
                    <Text style={styles.infoValue}>
                      {new Date(service.scheduled_date).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {service.notes && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Ionicons name="document-text" size={20} color={COLORS.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Notes</Text>
                    <Text style={styles.infoValue}>{service.notes}</Text>
                  </View>
                </View>
              </>
            )}
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Call Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.navigateButton]}
            onPress={handleNavigate}
          >
            <Ionicons name="navigate" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>

        {service.status === 'pending' && (
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Service</Text>
          </TouchableOpacity>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingXL,
  },
  emptyText: {
    fontSize: SIZES.body1,
    color: COLORS.textSecondary,
    marginTop: SIZES.marginMD,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  serviceIdCard: {
    marginBottom: SIZES.marginLG,
  },
  serviceIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceIdLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  serviceIdValue: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.primary,
    lineHeight: SIZES.h4 * 1.3,
    includeFontPadding: false,
  },
  section: {
    marginBottom: SIZES.marginLG,
  },
  sectionTitle: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginMD,
    lineHeight: SIZES.h6 * 1.3,
    includeFontPadding: false,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: SIZES.paddingSM,
  },
  infoContent: {
    flex: 1,
    marginLeft: SIZES.marginMD,
  },
  infoLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  infoAddress: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grey200,
    marginVertical: SIZES.marginSM,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: SIZES.marginMD,
    marginBottom: SIZES.marginLG,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingMD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.marginSM,
  },
  navigateButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.white,
    lineHeight: SIZES.body2 * 1.2,
    includeFontPadding: false,
  },
  startButton: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingLG,
    alignItems: 'center',
    marginBottom: SIZES.marginXL,
  },
  startButtonText: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: SIZES.h6 * 1.2,
    includeFontPadding: false,
  },
});

export default ServiceDetailScreen;
