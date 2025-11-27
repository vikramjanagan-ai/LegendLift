import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomerServicesScreen = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/services/schedules?customer_id=${user.customer_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Sort by date descending
        const sorted = data.sort((a, b) =>
          new Date(b.scheduled_date) - new Date(a.scheduled_date)
        );
        setServices(sorted);
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
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return theme.colors.success;
      case 'IN_PROGRESS':
        return theme.colors.info;
      case 'SCHEDULED':
        return theme.colors.primary;
      case 'PENDING':
        return theme.colors.warning;
      case 'OVERDUE':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
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

  const renderServiceCard = (service) => (
    <Card key={service.id} style={styles.serviceCard}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceId}>Service #{service.service_id}</Text>
          <Text style={styles.serviceType}>{service.service_type || 'Regular Service'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(service.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
            {service.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>Scheduled: {formatDate(service.scheduled_date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="clock-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>Time: {formatTime(service.scheduled_date)}</Text>
        </View>
        {service.technician_name && (
          <View style={styles.infoRow}>
            <Icon name="account-wrench" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Technician: {service.technician_name}</Text>
          </View>
        )}
        {service.actual_date && (
          <View style={styles.infoRow}>
            <Icon name="calendar-check" size={16} color={theme.colors.success} />
            <Text style={styles.infoText}>Completed: {formatDate(service.actual_date)}</Text>
          </View>
        )}
        {service.notes && (
          <View style={styles.infoRow}>
            <Icon name="note-text" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Notes: {service.notes}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Services</Text>
        <Text style={styles.subtitle}>{services.length} service(s) found</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : services.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="calendar-blank" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>Your service history will appear here</Text>
          </View>
        ) : (
          services.map(renderServiceCard)
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
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  loader: {
    marginTop: 50,
  },
  serviceCard: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  serviceType: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
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
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CustomerServicesScreen;
