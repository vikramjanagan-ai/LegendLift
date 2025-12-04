import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Header, ImageViewer } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RepairDetailsScreen = ({ route, navigation }) => {
  const { repairId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [repair, setRepair] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    fetchRepairDetails();
  }, [repairId]);

  const fetchRepairDetails = async () => {
    try {
      const [repairRes, techRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/repairs/${repairId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_CONFIG.BASE_URL}/repairs/${repairId}/technicians`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (repairRes.ok) {
        const data = await repairRes.json();
        setRepair(data);
      }

      if (techRes.ok) {
        const techData = await techRes.json();
        setTechnicians(Array.isArray(techData) ? techData : (techData.users || []));
      }
    } catch (error) {
      console.error('Error fetching repair details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return theme.colors.warning;
      case 'IN_PROGRESS':
        return theme.colors.info;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!repair) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Repair not found</Text>
      </View>
    );
  }

  const displayName = repair.existing_customer_name || repair.customer_name;
  const isNonCustomer = !repair.customer_id;

  return (
    <View style={styles.container}>
      <Header
        title="Repair Details"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Repair Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="tools" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Repair Information</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(repair.status) + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(repair.status) }]}>
                {getStatusLabel(repair.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer Name</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{displayName}</Text>
              {isNonCustomer && (
                <View style={styles.nonCustomerBadge}>
                  <Text style={styles.nonCustomerText}>Non-Customer</Text>
                </View>
              )}
            </View>
          </View>

          {repair.customer_job_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Job Number</Text>
              <Text style={styles.value}>{repair.customer_job_number}</Text>
            </View>
          )}

          {repair.contact_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Contact Number</Text>
              <TouchableOpacity onPress={() => handleCall(repair.contact_number)}>
                <Text style={[styles.value, styles.link]}>
                  <Icon name="phone" size={14} color={theme.colors.primary} /> {repair.contact_number}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Scheduled Date</Text>
            <Text style={styles.value}>{formatDate(repair.scheduled_date)}</Text>
          </View>

          {repair.completed_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Completed Date</Text>
              <Text style={styles.value}>{formatDate(repair.completed_date)}</Text>
            </View>
          )}

          {repair.description && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{repair.description}</Text>
            </View>
          )}
        </Card>

        {/* Assigned Technicians */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account-group" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Assigned Technicians</Text>
          </View>

          {technicians.length > 0 ? (
            technicians.map((tech, index) => (
              <View key={index} style={styles.techItem}>
                <Icon name="account-hard-hat" size={20} color={theme.colors.primary} />
                <View style={styles.techInfo}>
                  <Text style={styles.techName}>{tech.name}</Text>
                  <Text style={styles.techEmail}>{tech.email}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No technicians assigned</Text>
          )}
        </Card>

        {/* Admin Information */}
        {repair.admin_name && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="account-tie" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Created By</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Admin Name</Text>
              <Text style={styles.value}>{repair.admin_name}</Text>
            </View>

            {repair.created_at && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Created Date</Text>
                <Text style={styles.value}>{formatDate(repair.created_at)}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Before Images */}
        {repair.before_images && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="image-album" size={24} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>Before Repair Images</Text>
            </View>

            <ImageViewer
              images={repair.before_images}
              title="Before Repair"
              emptyMessage="No before images uploaded"
            />

            {repair.started_at && (
              <Text style={styles.imageDate}>
                Repair Started: {formatDate(repair.started_at)}
              </Text>
            )}
          </Card>
        )}

        {/* After Images */}
        {repair.after_images && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="image-multiple" size={24} color={theme.colors.success} />
              <Text style={styles.sectionTitle}>After Repair Images</Text>
            </View>

            <ImageViewer
              images={repair.after_images}
              title="After Repair"
              emptyMessage="No after images uploaded"
            />

            {repair.work_done && (
              <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
                <Text style={styles.label}>Work Done</Text>
                <Text style={styles.value}>{repair.work_done}</Text>
              </View>
            )}

            {repair.completed_at && (
              <Text style={styles.imageDate}>
                Repair Completed: {formatDate(repair.completed_at)}
              </Text>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        {repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Mark Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Icon name="account-plus" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Assign Technician</Text>
            </TouchableOpacity>

            {repair.contact_number && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => handleCall(repair.contact_number)}
              >
                <Icon name="phone" size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Call Customer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'right',
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  nonCustomerBadge: {
    backgroundColor: theme.colors.info + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nonCustomerText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.info,
  },
  link: {
    color: theme.colors.primary,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  techInfo: {
    marginLeft: 12,
    flex: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  techEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  noData: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButtonsContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default RepairDetailsScreen;
