import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Header } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentsScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const [stats, setStats] = useState({
    totalPaid: '₹0',
    totalPending: '₹0',
    totalOverdue: '₹0',
    paymentsCount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, selectedStatus, payments]);

  const fetchPayments = async () => {
    try {
      // Fetch payments
      const paymentsRes = await fetch(`${API_CONFIG.BASE_URL}/payments/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch payment stats
      const statsRes = await fetch(`${API_CONFIG.BASE_URL}/payments/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data);
        setFilteredPayments(data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalPaid: `₹${statsData.total_paid?.toLocaleString() || 0}`,
          totalPending: `₹${statsData.total_pending?.toLocaleString() || 0}`,
          totalOverdue: `₹${statsData.total_overdue?.toLocaleString() || 0}`,
          paymentsCount: statsData.payments_count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (payment) =>
          payment.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== null) {
      filtered = filtered.filter((payment) => payment.status === selectedStatus);
    }

    setFilteredPayments(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus(null);
    setShowSuggestions(false);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    if (text.trim().length > 0) {
      const uniqueSuggestions = new Set();

      payments.forEach((payment) => {
        if (payment.customer_name?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(payment.customer_name);
        }
        if (payment.invoice_number?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(payment.invoice_number);
        }
      });

      setSuggestions(Array.from(uniqueSuggestions));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      case 'OVERDUE':
        return theme.colors.error;
      case 'PARTIAL':
        return theme.colors.info;
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

  const renderPaymentCard = (payment) => (
    <TouchableOpacity
      key={payment.id}
      onPress={() => {
        navigation.navigate('PaymentDetails', { paymentId: payment.id });
      }}
    >
      <Card style={styles.paymentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.customerName}>{payment.customer_name || 'Unknown Customer'}</Text>
            <Text style={styles.invoiceNo}>Invoice: {payment.invoice_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
              {payment.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="currency-inr" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Amount: ₹{payment.amount?.toLocaleString()}</Text>
          </View>
          {payment.amount_paid > 0 && (
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={16} color={theme.colors.success} />
              <Text style={styles.infoText}>Paid: ₹{payment.amount_paid?.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Due: {formatDate(payment.due_date)}</Text>
          </View>
          {payment.payment_date && (
            <View style={styles.infoRow}>
              <Icon name="calendar-check" size={16} color={theme.colors.success} />
              <Text style={styles.infoText}>Paid on: {formatDate(payment.payment_date)}</Text>
            </View>
          )}
        </View>

        {payment.payment_method && (
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Method</Text>
              <Text style={styles.footerValue}>{payment.payment_method}</Text>
            </View>
            {payment.transaction_id && (
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>Transaction ID</Text>
                <Text style={styles.footerValue} numberOfLines={1}>{payment.transaction_id}</Text>
              </View>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Payments"
        subtitle={`${filteredPayments.length} payments found`}
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Total Paid</Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.totalPaid}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>{stats.totalPending}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Overdue</Text>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.totalOverdue}</Text>
        </Card>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search by customer or invoice..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={() => {
            if (searchQuery.trim().length > 0 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setShowSuggestions(false);
          }}>
            <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <Icon name="magnify" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {/* ALL Status */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedStatus === null && styles.filterChipActive,
          ]}
          onPress={() => setSelectedStatus(null)}
        >
          <Text style={[
            styles.filterChipText,
            selectedStatus === null && styles.filterChipTextActive,
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {/* Status Filters */}
        {['PAID', 'PENDING', 'OVERDUE', 'PARTIAL'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              selectedStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === status && styles.filterChipTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Clear Search */}
        {searchQuery && (
          <TouchableOpacity style={styles.clearFilterChip} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearFilterText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Payment List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : filteredPayments.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="cash-multiple" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedStatus
                ? 'Try adjusting your filters'
                : 'No payment records available'}
            </Text>
          </View>
        ) : (
          filteredPayments.map(renderPaymentCard)
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
  statsContainer: {
    maxHeight: 100,
    marginVertical: 15,
  },
  statsContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  statCard: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 140,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: -10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey100,
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  filtersContainer: {
    maxHeight: 50,
    marginVertical: 10,
  },
  filtersContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  clearFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.error,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loader: {
    marginTop: 50,
  },
  paymentCard: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  invoiceNo: {
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
    marginBottom: 12,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 4,
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

export default PaymentsScreen;
