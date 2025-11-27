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

const PaymentDetailsScreen = ({ route, navigation }) => {
  const { paymentId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'PAID') return theme.colors.success;
    if (status === 'PARTIAL') return theme.colors.warning;
    if (status === 'PENDING') return theme.colors.error;
    if (status === 'OVERDUE') return '#8B0000';
    return theme.colors.textSecondary;
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

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'N/A';
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Payment not found</Text>
      </View>
    );
  }

  const isFullyPaid = payment.status === 'PAID';

  return (
    <View style={styles.container}>
      <Header
        title="Payment Details"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Payment Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cash-multiple" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(payment.status) + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                {payment.status || 'PENDING'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{payment.invoice_number || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{payment.customer_name || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{formatCurrency(payment.amount)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={[styles.value, { color: theme.colors.success }]}>
              {formatCurrency(payment.amount_paid)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Balance Due</Text>
            <Text style={[styles.value, { color: theme.colors.error }]}>
              {formatCurrency(payment.balance_due)}
            </Text>
          </View>
        </Card>

        {/* Payment Details */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="calendar-clock" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Date</Text>
            <Text style={styles.value}>{formatDate(payment.payment_date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{formatDate(payment.due_date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{payment.payment_method || 'N/A'}</Text>
          </View>

          {payment.transaction_id && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={[styles.value, styles.link]}>{payment.transaction_id}</Text>
            </View>
          )}
        </Card>

        {/* Service Reference */}
        {payment.service_id && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="tools" size={24} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Service Reference</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Service ID</Text>
              <Text style={[styles.value, styles.link]}>{payment.service_id}</Text>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {!isFullyPaid && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Icon name="cash-plus" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Record Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton}>
              <Icon name="bell-ring" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Send Reminder</Text>
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
  link: {
    color: theme.colors.primary,
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

export default PaymentDetailsScreen;
