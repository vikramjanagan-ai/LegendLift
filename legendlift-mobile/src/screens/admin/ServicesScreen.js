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
import { API_CONFIG, SERVICE_STATUS } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ServicesScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedStatus, services]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
        setFilteredServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.job_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.area?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== null) {
      filtered = filtered.filter((service) => service.status === selectedStatus);
    }

    setFilteredServices(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus(null);
    setShowSuggestions(false);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);

    if (text.trim().length > 0) {
      // Generate suggestions based on matches starting with the search text
      const uniqueSuggestions = new Set();

      services.forEach((service) => {
        // Match customer names starting with search text
        if (service.customer_name?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(service.customer_name);
        }
        // Match job numbers starting with search text
        if (service.job_number?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(service.job_number);
        }
        // Match areas starting with search text
        if (service.area?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(service.area);
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
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      onPress={() => {
        navigation.navigate('ServiceDetails', { serviceId: service.id });
      }}
      activeOpacity={0.7}
    >
      <Card style={styles.serviceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.customerName}>{service.customer_name}</Text>
            <Text style={styles.jobNo}>Job No: {service.job_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(service.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
              {service.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{service.area || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(service.scheduled_date)}</Text>
          </View>
          {service.technician_name && (
            <View style={styles.infoRow}>
              <Icon name="account-wrench" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{service.technician_name}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Type</Text>
            <Text style={styles.footerValue}>{service.service_type || 'Scheduled'}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Priority</Text>
            <Text style={styles.footerValue}>{service.priority || 'Normal'}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Route</Text>
            <Text style={styles.footerValue}>{service.route || 'N/A'}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Services"
        subtitle={`${filteredServices.length} services found`}
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search by customer, job no, or area..."
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
        {/* Status Filters */}
        {['pending', 'scheduled', 'in_progress', 'completed', 'overdue'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              selectedStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(selectedStatus === status ? null : status)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === status && styles.filterChipTextActive,
              ]}
            >
              {status.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Clear Filters */}
        {(selectedStatus || searchQuery) && (
          <TouchableOpacity style={styles.clearFilterChip} onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Services List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScrollBeginDrag={() => {
          setShowSuggestions(false);
          Keyboard.dismiss();
        }}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedStatus
                ? 'Try adjusting your filters'
                : 'No services in the database'}
            </Text>
          </View>
        ) : (
          filteredServices.map(renderServiceCard)
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
});

export default ServicesScreen;
