import React, { useState, useCallback } from 'react';
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

const TechnicianRepairsScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchRepairs();
    }, [])
  );

  const fetchRepairs = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/repairs/technician/my-repairs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRepairs(data);
      } else {
        console.error('Failed to fetch repairs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRepairs();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'completed';
      case 'IN_PROGRESS':
        return 'info';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return COLORS.error;
      case 'MEDIUM':
        return COLORS.warning;
      case 'LOW':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="My Repairs"
          showBack={false}
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
        title="My Repairs"
        showBack={false}
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
            <Text style={styles.statValue}>{repairs.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.pending }]}>
              {repairs.filter((r) => r.status === 'PENDING').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>
              {repairs.filter((r) => r.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        {/* Repairs List */}
        {repairs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={64} color={COLORS.grey400} />
            <Text style={styles.emptyText}>No repairs assigned</Text>
          </View>
        ) : (
          repairs.map((repair) => (
            <Card
              key={repair.id}
              style={styles.repairCard}
              onPress={() =>
                navigation.navigate('RepairDetail', { repairId: repair.id })
              }
            >
              <View style={styles.repairHeader}>
                <View style={styles.repairInfo}>
                  <Text style={styles.customerName}>
                    {repair.existing_customer_name || repair.customer_name}
                  </Text>
                  {repair.customer_job_number && (
                    <Text style={styles.jobNumber}>Job No: {repair.customer_job_number}</Text>
                  )}
                  {repair.contact_number && (
                    <View style={styles.contactRow}>
                      <Ionicons
                        name="call"
                        size={14}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.contactText}>{repair.contact_number}</Text>
                    </View>
                  )}
                  {!repair.customer_id && (
                    <View style={styles.nonCustomerBadge}>
                      <Text style={styles.nonCustomerText}>Non-Customer</Text>
                    </View>
                  )}
                </View>
                <Badge
                  text={repair.status}
                  variant={getStatusColor(repair.status)}
                  size="small"
                />
              </View>

              {repair.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Issue:</Text>
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {repair.description}
                  </Text>
                </View>
              )}

              <View style={styles.repairDetails}>
                {repair.machine_type && (
                  <View style={styles.detailItem}>
                    <Ionicons name="build" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{repair.machine_type}</Text>
                  </View>
                )}
                {repair.priority && (
                  <View style={styles.detailItem}>
                    <Ionicons name="flag" size={16} color={getPriorityColor(repair.priority)} />
                    <Text style={[styles.detailText, { color: getPriorityColor(repair.priority) }]}>
                      {repair.priority}
                    </Text>
                  </View>
                )}
              </View>

              {repair.scheduled_date && (
                <View style={styles.scheduledContainer}>
                  <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.scheduledText}>
                    Scheduled: {new Date(repair.scheduled_date).toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles.repairFooter}>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => {
                    if (repair.contact_number) {
                      // Handle call action
                    }
                  }}
                >
                  <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.footerButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerButton}>
                  <Ionicons name="location-outline" size={18} color={COLORS.primary} />
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
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  repairCard: {
    marginBottom: SIZES.marginMD,
  },
  repairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginMD,
  },
  repairInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  jobNumber: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  contactText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  nonCustomerBadge: {
    backgroundColor: COLORS.info + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSM,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  nonCustomerText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.info,
    lineHeight: 10 * 1.3,
    includeFontPadding: false,
  },
  descriptionContainer: {
    marginBottom: SIZES.marginMD,
  },
  descriptionLabel: {
    fontSize: SIZES.body3,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  descriptionText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  repairDetails: {
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
  scheduledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.marginMD,
  },
  scheduledText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  repairFooter: {
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
    lineHeight: SIZES.body3 * 1.2,
    includeFontPadding: false,
  },
});

export default TechnicianRepairsScreen;
