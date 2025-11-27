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

const TechnicianCallbacksScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCallbacks();
    }, [])
  );

  const fetchCallbacks = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/callbacks/technician/my-callbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCallbacks(data);
      } else {
        console.error('Failed to fetch callbacks:', response.status);
      }
    } catch (error) {
      console.error('Error fetching callbacks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCallbacks();
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
          title="My Callbacks"
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
        title="My Callbacks"
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
            <Text style={styles.statValue}>{callbacks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.pending }]}>
              {callbacks.filter((c) => c.status === 'PENDING').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.info }]}>
              {callbacks.filter((c) => c.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>

        {/* Callbacks List */}
        {callbacks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="call-outline" size={64} color={COLORS.grey400} />
            <Text style={styles.emptyText}>No callbacks assigned</Text>
          </View>
        ) : (
          callbacks.map((callback) => (
            <Card
              key={callback.id}
              style={styles.callbackCard}
              onPress={() =>
                navigation.navigate('CallbackDetail', { callbackId: callback.id })
              }
            >
              <View style={styles.callbackHeader}>
                <View style={styles.callbackInfo}>
                  <Text style={styles.customerName}>{callback.customer_name}</Text>
                  {callback.customer_job_number && (
                    <Text style={styles.jobNumber}>Job No: {callback.customer_job_number}</Text>
                  )}
                  {callback.contact_number && (
                    <View style={styles.contactRow}>
                      <Ionicons
                        name="call"
                        size={14}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.contactText}>{callback.contact_number}</Text>
                    </View>
                  )}
                  {callback.area && (
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location"
                        size={14}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.locationText}>{callback.area}</Text>
                    </View>
                  )}
                </View>
                <Badge
                  text={callback.status}
                  variant={getStatusColor(callback.status)}
                  size="small"
                />
              </View>

              {callback.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Description:</Text>
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {callback.description}
                  </Text>
                </View>
              )}

              <View style={styles.callbackDetails}>
                {callback.priority && (
                  <View style={styles.detailItem}>
                    <Ionicons name="flag" size={16} color={getPriorityColor(callback.priority)} />
                    <Text style={[styles.detailText, { color: getPriorityColor(callback.priority) }]}>
                      {callback.priority}
                    </Text>
                  </View>
                )}
                {callback.scheduled_date && (
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>
                      {new Date(callback.scheduled_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.callbackFooter}>
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => {
                    if (callback.contact_number) {
                      // Handle call action
                    }
                  }}
                >
                  <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.footerButtonText}>Call</Text>
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
  callbackCard: {
    marginBottom: SIZES.marginMD,
  },
  callbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginMD,
  },
  callbackInfo: {
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
    marginBottom: 2,
  },
  contactText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
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
  callbackDetails: {
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
  callbackFooter: {
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

export default TechnicianCallbacksScreen;
