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
import { useSelector } from 'react-redux';
import { Card, Header } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CallBackDetailsScreen = ({ route, navigation }) => {
  const { callbackId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [callback, setCallback] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    fetchCallBackDetails();
  }, [callbackId]);

  const fetchCallBackDetails = async () => {
    try {
      const [callbackRes, techRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/callbacks/${callbackId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_CONFIG.BASE_URL}/callbacks/${callbackId}/technicians`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (callbackRes.ok) {
        const data = await callbackRes.json();
        setCallback(data);
      }

      if (techRes.ok) {
        const techData = await techRes.json();
        setTechnicians(Array.isArray(techData) ? techData : (techData.users || []));
      }
    } catch (error) {
      console.error('Error fetching callback details:', error);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!callback) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>CallBack not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="CallBack Details"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* CallBack Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="phone-in-talk" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>CallBack Information</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(callback.status) + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(callback.status) }]}>
                {getStatusLabel(callback.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{callback.customer_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Job Number</Text>
            <Text style={styles.value}>{callback.customer_job_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Scheduled Date</Text>
            <Text style={styles.value}>{formatDate(callback.scheduled_date)}</Text>
          </View>

          {callback.completed_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Completed Date</Text>
              <Text style={styles.value}>{formatDate(callback.completed_date)}</Text>
            </View>
          )}

          {callback.description && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{callback.description}</Text>
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
        {callback.admin_name && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="account-tie" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Created By</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Admin Name</Text>
              <Text style={styles.value}>{callback.admin_name}</Text>
            </View>

            {callback.created_at && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Created Date</Text>
                <Text style={styles.value}>{formatDate(callback.created_at)}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        {callback.status !== 'COMPLETED' && callback.status !== 'CANCELLED' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Mark Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Icon name="account-plus" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Assign Technician</Text>
            </TouchableOpacity>
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
    flex: 1,
    textAlign: 'right',
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
});

export default CallBackDetailsScreen;
