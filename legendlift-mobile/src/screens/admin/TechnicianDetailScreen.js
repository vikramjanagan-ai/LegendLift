import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Header, Card, Badge } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const TechnicianDetailScreen = ({ route, navigation }) => {
  const { technicianId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [technician, setTechnician] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchTechnicianDetail();
  }, [technicianId]);

  const fetchTechnicianDetail = async () => {
    try {
      // Fetch technician details
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/technicians/${technicianId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTechnician(data);
      }

      // Fetch technician stats (you could add this endpoint)
      // For now, we'll use mock data
      setStats({
        totalServices: 142,
        completedServices: 135,
        pendingServices: 7,
        averageRating: 4.5,
        completionRate: 95,
      });
    } catch (error) {
      console.error('Error fetching technician:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = !technician.active;
    const action = newStatus ? 'activate' : 'deactivate';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Technician`,
      `Are you sure you want to ${action} ${technician.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_CONFIG.BASE_URL}/admin/technicians/${technicianId}/${action}`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Success', `Technician ${action}d successfully`);
                fetchTechnicianDetail();
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} technician`);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Technician Details"
          showBack
          onLeftPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  if (!technician) {
    return (
      <View style={styles.container}>
        <Header
          title="Technician Details"
          showBack
          onLeftPress={() => navigation.goBack()}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.grey400} />
          <Text style={styles.emptyText}>Technician not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Technician Details"
        showBack
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={COLORS.white} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{technician.name}</Text>
              <Text style={styles.role}>Technician</Text>
              <Badge
                text={technician.active ? 'Active' : 'Inactive'}
                variant={technician.active ? 'completed' : 'default'}
              />
            </View>
          </View>
        </Card>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Card>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{technician.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{technician.phone}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Joined</Text>
                <Text style={styles.infoValue}>
                  {new Date(technician.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Performance Stats */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                <Text style={styles.statValue}>{stats.completedServices}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </Card>

              <Card style={styles.statCard}>
                <Ionicons name="time" size={32} color={COLORS.pending} />
                <Text style={styles.statValue}>{stats.pendingServices}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </Card>

              <Card style={styles.statCard}>
                <Ionicons name="star" size={32} color={COLORS.warning} />
                <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </Card>

              <Card style={styles.statCard}>
                <Ionicons name="trending-up" size={32} color={COLORS.primary} />
                <Text style={styles.statValue}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </Card>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              !technician.active && styles.activateButton,
            ]}
            onPress={handleToggleStatus}
          >
            <Ionicons
              name={technician.active ? 'close-circle' : 'checkmark-circle'}
              size={24}
              color={COLORS.white}
            />
            <Text style={styles.actionButtonText}>
              {technician.active ? 'Deactivate' : 'Activate'} Technician
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  headerCard: {
    marginBottom: SIZES.marginLG,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.marginMD,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.marginSM,
  },
  section: {
    marginBottom: SIZES.marginLG,
  },
  sectionTitle: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginMD,
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
  },
  infoValue: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grey200,
    marginVertical: SIZES.marginSM,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.marginMD,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    padding: SIZES.paddingMD,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.marginSM,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  actionButton: {
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingLG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.marginSM,
    ...SHADOWS.small,
  },
  activateButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default TechnicianDetailScreen;
