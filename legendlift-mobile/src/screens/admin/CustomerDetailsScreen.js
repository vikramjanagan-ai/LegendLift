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

const CustomerDetailsScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchCustomerDetails();
    fetchCustomerServices();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerServices = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/schedules?customer_id=${customerId}`, {
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
    }
  };

  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return theme.colors.success;
    return theme.colors.error;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Customer not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Customer Details"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{customer.name}</Text>
          </View>

          {customer.site_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Site Name</Text>
              <Text style={styles.value}>{customer.site_name}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Job Number</Text>
            <Text style={styles.value}>{customer.job_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact Person</Text>
            <Text style={styles.value}>{customer.contact_person}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={[styles.value, styles.link]}>{customer.phone}</Text>
          </View>

          {customer.email && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={[styles.value, styles.link]}>{customer.email}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Address</Text>
            <Text style={styles.value}>{customer.address}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Area</Text>
            <Text style={styles.value}>{customer.area}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Route</Text>
            <Text style={styles.value}>Route {customer.route}</Text>
          </View>
        </Card>

        {/* AMC Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="file-document" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>AMC Information</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(customer.amc_status) + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(customer.amc_status) }]}>
                {customer.amc_status || 'INACTIVE'}
              </Text>
            </View>
          </View>

          {customer.amc_valid_from && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>AMC Valid From</Text>
              <Text style={styles.value}>{formatDate(customer.amc_valid_from)}</Text>
            </View>
          )}

          {customer.amc_valid_to && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>AMC Valid To</Text>
              <Text style={styles.value}>{formatDate(customer.amc_valid_to)}</Text>
            </View>
          )}

          {customer.services_per_year && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Services Per Year</Text>
              <Text style={styles.value}>{customer.services_per_year}</Text>
            </View>
          )}

          {customer.amc_amount !== null && customer.amc_amount !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>AMC Amount</Text>
              <Text style={styles.value}>₹{customer.amc_amount?.toLocaleString()}</Text>
            </View>
          )}

          {customer.amc_amount_received !== null && customer.amc_amount_received !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Amount Received</Text>
              <Text style={styles.value}>₹{customer.amc_amount_received?.toLocaleString()}</Text>
            </View>
          )}

          {customer.amc_amount !== null && customer.amc_amount_received !== null && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Balance</Text>
              <Text style={[styles.value, { color: theme.colors.error }]}>
                ₹{(customer.amc_amount - customer.amc_amount_received)?.toLocaleString()}
              </Text>
            </View>
          )}

          {customer.aiims_status && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>AIIMS Status</Text>
              <View style={styles.aiimsBadge}>
                <Icon name="hospital-building" size={16} color={theme.colors.success} />
                <Text style={[styles.value, { color: theme.colors.success, marginLeft: 8 }]}>
                  AIIMS Client
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Services */}
        {services.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="clipboard-list" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Scheduled Services ({services.length})</Text>
            </View>

            {services.slice(0, 5).map((service, index) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceLeft}>
                  <Text style={styles.serviceName}>{service.service_id}</Text>
                  <Text style={styles.serviceDate}>{formatDate(service.scheduled_date)}</Text>
                </View>
                <View style={[
                  styles.serviceStatus,
                  {
                    backgroundColor: service.status === 'completed' ? theme.colors.success + '20' :
                      service.status === 'pending' ? theme.colors.warning + '20' : theme.colors.info + '20'
                  }
                ]}>
                  <Text style={[
                    styles.serviceStatusText,
                    {
                      color: service.status === 'completed' ? theme.colors.success :
                        service.status === 'pending' ? theme.colors.warning : theme.colors.info
                    }
                  ]}>
                    {service.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}

            {services.length > 5 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Services ({services.length})</Text>
                <Icon name="chevron-right" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Edit Customer</Text>
          </TouchableOpacity>

          {customer.amc_status === 'ACTIVE' && (
            <TouchableOpacity style={styles.secondaryButton}>
              <Icon name="phone-in-talk" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Create CallBack</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.secondaryButton}>
            <Icon name="tools" size={20} color={theme.colors.primary} />
            <Text style={styles.secondaryButtonText}>Create Repair</Text>
          </TouchableOpacity>
        </View>
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
  link: {
    color: theme.colors.primary,
  },
  aiimsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  serviceLeft: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  serviceDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  serviceStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    marginRight: 4,
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

export default CustomerDetailsScreen;
