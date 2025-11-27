import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Header, Card, Badge } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const ServiceHistoryScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/technician/service-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderRating = (rating) => {
    if (!rating) return null;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={COLORS.warning}
        />
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Service History" showBack={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Service History" showBack={false} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>{services.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="star" size={32} color={COLORS.warning} />
            <Text style={styles.statValue}>
              {services.length > 0
                ? (
                    services.reduce((acc, s) => acc + (s.rating || 0), 0) /
                    services.filter((s) => s.rating).length
                  ).toFixed(1)
                : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* History List */}
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.grey400} />
            <Text style={styles.emptyText}>No completed services yet</Text>
          </View>
        ) : (
          services.map((service, index) => (
            <Card key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyInfo}>
                  <Text style={styles.serviceId}>{service.service_id}</Text>
                  <Text style={styles.customerName}>{service.customer_name}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.locationText}>{service.customer_location}</Text>
                  </View>
                </View>
                <Badge text="Completed" variant="completed" size="small" />
              </View>

              <View style={styles.divider} />

              <View style={styles.historyDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>
                    {service.actual_date
                      ? new Date(service.actual_date).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag" size={16} color={COLORS.primary} />
                  <Text style={styles.detailText}>
                    {service.service_type.charAt(0).toUpperCase() +
                      service.service_type.slice(1)}
                  </Text>
                </View>
              </View>

              {service.rating && (
                <View style={styles.ratingSection}>
                  {renderRating(service.rating)}
                </View>
              )}

              {service.work_done && (
                <View style={styles.workDoneSection}>
                  <Text style={styles.workDoneLabel}>Work Done:</Text>
                  <Text style={styles.workDoneText} numberOfLines={2}>
                    {service.work_done}
                  </Text>
                </View>
              )}
            </Card>
          ))
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
    color: COLORS.textPrimary,
    marginTop: SIZES.marginSM,
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
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  historyCard: {
    marginBottom: SIZES.marginMD,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginMD,
  },
  historyInfo: {
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
  customerName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grey200,
    marginBottom: SIZES.marginMD,
  },
  historyDetails: {
    flexDirection: 'row',
    gap: SIZES.marginLG,
    marginBottom: SIZES.marginSM,
  },
  detailRow: {
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
  ratingSection: {
    marginTop: SIZES.marginSM,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  workDoneSection: {
    marginTop: SIZES.marginMD,
    padding: SIZES.paddingSM,
    backgroundColor: COLORS.grey50,
    borderRadius: SIZES.radiusSM,
  },
  workDoneLabel: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  workDoneText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
});

export default ServiceHistoryScreen;
