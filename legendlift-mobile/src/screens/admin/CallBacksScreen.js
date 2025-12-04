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
import CallBackFormModal from '../../components/admin/CallBackFormModal';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CallBacksScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [callbacks, setCallbacks] = useState([]);
  const [filteredCallbacks, setFilteredCallbacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);

  // Modal states
  const [showCallBackModal, setShowCallBackModal] = useState(false);
  const [selectedCallBack, setSelectedCallBack] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCallBacks();
  }, []);

  useEffect(() => {
    filterCallBacks();
  }, [searchQuery, selectedStatus, callbacks]);

  const fetchCallBacks = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/callbacks/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCallbacks(data);
        setFilteredCallbacks(data);
      }
    } catch (error) {
      console.error('Error fetching callbacks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getPriorityOrder = (priority) => {
    const order = { urgent: 1, high: 2, medium: 3, low: 4 };
    return order[priority?.toLowerCase()] || 5;
  };

  const filterCallBacks = () => {
    let filtered = [...callbacks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (callback) =>
          callback.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          callback.customer_job_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          callback.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter((callback) => callback.status === selectedStatus);
    }

    // Sort by priority (urgent first, then high, medium, low)
    filtered.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));

    setFilteredCallbacks(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCallBacks();
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

      callbacks.forEach((callback) => {
        if (callback.customer_name?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(callback.customer_name);
        }
        if (callback.customer_job_number?.toLowerCase().startsWith(text.toLowerCase())) {
          uniqueSuggestions.add(callback.customer_job_number);
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

  const handleAddCallBack = () => {
    setSelectedCallBack(null);
    setShowCallBackModal(true);
  };

  const handleEditCallBack = (callback) => {
    setSelectedCallBack(callback);
    setShowCallBackModal(true);
  };

  const handleSubmitCallBack = async (callbackData, selectedTechnicians = []) => {
    setSubmitting(true);
    try {
      const url = selectedCallBack
        ? `${API_CONFIG.BASE_URL}/callbacks/${selectedCallBack.id}`
        : `${API_CONFIG.BASE_URL}/callbacks/`;

      const method = selectedCallBack ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackData),
      });

      if (response.ok) {
        const savedCallback = await response.json();

        // Handle technician assignments
        if (selectedCallBack) {
          // UPDATE: Sync technicians - add new, remove old
          const oldTechnicians = selectedCallBack.technicians || [];
          const newTechnicians = selectedTechnicians;

          // Find technicians to add (in new but not in old)
          const toAdd = newTechnicians.filter(id => !oldTechnicians.includes(id));

          // Find technicians to remove (in old but not in new)
          const toRemove = oldTechnicians.filter(id => !newTechnicians.includes(id));

          // Add new technicians
          for (const techId of toAdd) {
            await fetch(`${API_CONFIG.BASE_URL}/callbacks/${savedCallback.id}/assign`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ technician_id: techId }),
            });
          }

          // Remove unassigned technicians
          for (const techId of toRemove) {
            await fetch(`${API_CONFIG.BASE_URL}/callbacks/${savedCallback.id}/unassign/${techId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
          }
        } else if (selectedTechnicians.length > 0) {
          // CREATE: Assign selected technicians if any
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

        const message = selectedCallBack
          ? 'CallBack updated successfully'
          : selectedTechnicians.length > 0
            ? `CallBack created and assigned to ${selectedTechnicians.length} technician(s)`
            : 'CallBack created successfully. Technicians can now pick this job.';

        Alert.alert('Success', message);
        setShowCallBackModal(false);
        fetchCallBacks();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to save callback');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save callback');
      console.error('Error saving callback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCallBack = (callbackId) => {
    Alert.alert(
      'Delete CallBack',
      'Are you sure you want to delete this callback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_CONFIG.BASE_URL}/callbacks/${callbackId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'CallBack deleted successfully');
                fetchCallBacks();
              } else {
                Alert.alert('Error', 'Failed to delete callback');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete callback');
              console.error('Error deleting callback:', error);
            }
          },
        },
      ]
    );
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

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case 'urgent':
        return '#DC2626'; // Red
      case 'high':
        return '#EA580C'; // Orange
      case 'medium':
        return '#D97706'; // Amber
      case 'low':
        return '#059669'; // Green
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityLabel = (priority) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';
  };

  const renderCallBackCard = (callback) => (
    <TouchableOpacity
      key={callback.id}
      onPress={() => navigation.navigate('CallBackDetails', { callbackId: callback.id })}
    >
      <Card style={styles.callbackCard}>
        <View style={styles.cardHeader}>
          <View style={styles.callbackInfo}>
            <View style={styles.headerRow}>
              <Text style={styles.customerName}>{callback.customer_name}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(callback.priority) }
              ]}>
                <Text style={styles.priorityText}>
                  {getPriorityLabel(callback.priority)}
                </Text>
              </View>
            </View>
            <Text style={styles.jobNo}>Job No: {callback.customer_job_number}</Text>
            <Text style={styles.scheduledDate}>
              <Icon name="calendar-clock" size={14} color={theme.colors.textSecondary} />
              {' '}{new Date(callback.scheduled_date).toLocaleString()}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(callback.status) + '20' }
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(callback.status) }]}>
              {getStatusLabel(callback.status)}
            </Text>
          </View>
        </View>

      {callback.description && (
        <View style={styles.cardBody}>
          <Text style={styles.descriptionLabel}>Description:</Text>
          <Text style={styles.descriptionText}>{callback.description}</Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Icon name="account-group" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.infoText}>
            {callback.technicians?.length || 0} Technician(s)
          </Text>
        </View>
        {callback.admin_name && (
          <View style={styles.infoItem}>
            <Icon name="account-tie" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {callback.admin_name}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditCallBack(callback)}
        >
          <Icon name="pencil" size={16} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCallBack(callback.id)}
        >
          <Icon name="delete" size={16} color={theme.colors.white} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="CallBacks"
        subtitle={`${filteredCallbacks.length} callbacks found`}
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search by customer, job no, or description..."
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
          <Text
            style={[
              styles.filterChipText,
              selectedStatus === null && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
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
              {getStatusLabel(status)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Clear Filters */}
        {searchQuery && (
          <TouchableOpacity style={styles.clearFilterChip} onPress={clearFilters}>
            <Text style={styles.clearFilterText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* CallBack List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : filteredCallbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="phone-in-talk" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No callbacks found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || selectedStatus
                ? 'Try adjusting your filters'
                : 'No callbacks in the database'}
            </Text>
          </View>
        ) : (
          filteredCallbacks.map(renderCallBackCard)
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddCallBack}>
        <Icon name="plus" size={28} color={theme.colors.white} />
      </TouchableOpacity>

      {/* CallBack Form Modal */}
      <CallBackFormModal
        visible={showCallBackModal}
        onClose={() => setShowCallBackModal(false)}
        onSubmit={handleSubmitCallBack}
        callback={selectedCallBack}
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
  callbackCard: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  callbackInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  jobNo: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  scheduledDate: {
    fontSize: 13,
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
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  cardInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.text,
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
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.white,
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

export default CallBacksScreen;
