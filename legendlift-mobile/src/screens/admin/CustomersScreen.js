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
  Alert,
  Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Header } from '../../components/common';
import { CustomerFormModal, CallBackFormModal, RepairFormModal } from '../../components/admin';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG, AMC_STATUS, ROUTES } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomersScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // CallBack and Repair modal states
  const [showCallBackModal, setShowCallBackModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [modalCustomer, setModalCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, selectedRoute, selectedStatus, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/customers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.job_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.area.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Route filter
    if (selectedRoute !== null) {
      filtered = filtered.filter((customer) => customer.route === selectedRoute);
    }

    setFilteredCustomers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRoute(null);
    setSelectedStatus(null);
    setShowSuggestions(false);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    if (text.trim().length > 0) {
      const uniqueSuggestions = new Set();

      customers.forEach((customer) => {
        if (customer.name?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(customer.name);
        }
        if (customer.job_number?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(customer.job_number);
        }
        if (customer.area?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(customer.area);
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

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleSubmitCustomer = async (customerData) => {
    setSubmitting(true);
    try {
      const url = selectedCustomer
        ? `${API_CONFIG.BASE_URL}/customers/${selectedCustomer.id}`
        : `${API_CONFIG.BASE_URL}/customers/`;

      const method = selectedCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          selectedCustomer ? 'Customer updated successfully' : 'Customer added successfully'
        );
        setShowCustomerModal(false);
        fetchCustomers();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to save customer');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
      console.error('Error saving customer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCallBack = (customer) => {
    setModalCustomer(customer);
    setShowCallBackModal(true);
  };

  const handleCreateRepair = (customer) => {
    setModalCustomer(customer);
    setShowRepairModal(true);
  };

  const handleSubmitCallBack = async (callbackData, selectedTechnicians) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/callbacks/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackData),
      });

      if (response.ok) {
        const savedCallback = await response.json();

        // Assign technicians if any selected
        if (selectedTechnicians.length > 0) {
          for (const techId of selectedTechnicians) {
            await fetch(`${API_CONFIG.BASE_URL}/callbacks/${savedCallback.id}/assign`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ technician_id: techId }),
            });
          }
        }

        Alert.alert('Success', 'CallBack created successfully');
        setShowCallBackModal(false);
        setModalCustomer(null);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to create callback');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create callback');
      console.error('Error creating callback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRepair = async (repairData, selectedTechnicians) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/repairs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repairData),
      });

      if (response.ok) {
        const savedRepair = await response.json();

        // Assign technicians if any selected
        if (selectedTechnicians.length > 0) {
          for (const techId of selectedTechnicians) {
            await fetch(`${API_CONFIG.BASE_URL}/repairs/${savedRepair.id}/assign`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ technician_id: techId }),
            });
          }
        }

        Alert.alert('Success', 'Repair created successfully');
        setShowRepairModal(false);
        setModalCustomer(null);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to create repair');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create repair');
      console.error('Error creating repair:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return theme.colors.success;
    return theme.colors.error;
  };

  const renderCustomerCard = (customer) => (
    <TouchableOpacity
      key={customer.id}
      onPress={() => navigation.navigate('CustomerDetails', { customerId: customer.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.customerCard}>
        <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.jobNo}>Job No: {customer.job_number}</Text>
          {customer.site_name && (
            <Text style={styles.siteName}>Site: {customer.site_name}</Text>
          )}
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(customer.amc_status) + '20' }
        ]}>
          <Text style={[styles.statusText, { color: getStatusColor(customer.amc_status) }]}>
            {customer.amc_status || 'INACTIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>{customer.area}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>{customer.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="routes" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>Route {customer.route}</Text>
        </View>
        {customer.amc_valid_to && (
          <View style={styles.infoRow}>
            <Icon name="calendar-clock" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>
              AMC Valid Until: {new Date(customer.amc_valid_to).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCustomer(customer)}
        >
          <Icon name="pencil" size={16} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        {customer.amc_status === 'ACTIVE' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callbackButton]}
            onPress={() => handleCreateCallBack(customer)}
          >
            <Icon name="phone-in-talk" size={16} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>CallBack</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.repairButton]}
          onPress={() => handleCreateRepair(customer)}
        >
          <Icon name="tools" size={16} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Repair</Text>
        </TouchableOpacity>
      </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Customers"
        subtitle={`${filteredCustomers.length} customers found`}
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search by name, job no, or location..."
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
        {/* Route Filters */}
        {ROUTES.map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.filterChip,
              selectedRoute === route.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedRoute === route.id && styles.filterChipTextActive,
              ]}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Clear Filters */}
        {(selectedRoute || searchQuery) && (
          <TouchableOpacity style={styles.clearFilterChip} onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Customer List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="account-search" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No customers found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedRoute || selectedStatus
                ? 'Try adjusting your filters'
                : 'No customers in the database'}
            </Text>
          </View>
        ) : (
          filteredCustomers.map(renderCustomerCard)
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
        <Icon name="plus" size={28} color={theme.colors.white} />
      </TouchableOpacity>

      {/* Customer Form Modal */}
      <CustomerFormModal
        visible={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleSubmitCustomer}
        customer={selectedCustomer}
        loading={submitting}
      />

      {/* CallBack Form Modal */}
      <CallBackFormModal
        visible={showCallBackModal}
        onClose={() => {
          setShowCallBackModal(false);
          setModalCustomer(null);
        }}
        onSubmit={handleSubmitCallBack}
        preSelectedCustomer={modalCustomer}
        loading={submitting}
      />

      {/* Repair Form Modal */}
      <RepairFormModal
        visible={showRepairModal}
        onClose={() => {
          setShowRepairModal(false);
          setModalCustomer(null);
        }}
        onSubmit={handleSubmitRepair}
        preSelectedCustomer={modalCustomer}
        loading={submitting}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
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
    marginBottom: 10,
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
  customerCard: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  jobNo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  siteName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
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
    alignItems: 'center',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: theme.colors.info,
  },
  callbackButton: {
    backgroundColor: theme.colors.warning,
  },
  repairButton: {
    backgroundColor: theme.colors.secondary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.white,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default CustomersScreen;
