import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { API_CONFIG } from '../../constants';

const CallbacksScreen = () => {
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my-callbacks'
  const [availableCallbacks, setAvailableCallbacks] = useState([]);
  const [myCallbacks, setMyCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const token = useSelector((state) => state.auth.token);

  const getPriorityOrder = (priority) => {
    const order = { urgent: 1, high: 2, medium: 3, low: 4 };
    return order[priority?.toLowerCase()] || 5;
  };

  const fetchAvailableCallbacks = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/complaints/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by priority
        const sorted = data.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
        setAvailableCallbacks(sorted);
      }
    } catch (error) {
      console.error('Error fetching available callbacks:', error);
    }
  };

  const fetchMyCallbacks = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/complaints/my-callbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by priority
        const sorted = data.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
        setMyCallbacks(sorted);
      }
    } catch (error) {
      console.error('Error fetching my callbacks:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchAvailableCallbacks(), fetchMyCallbacks()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllData();
  }, []);

  const handleClaimCallback = async (callbackId, callbackTitle) => {
    Alert.alert(
      'Claim Callback',
      `Do you want to claim "${callbackTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_CONFIG.BASE_URL}/complaints/${callbackId}/claim`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert('Success', 'Callback claimed successfully!');
                fetchAllData();
                setActiveTab('my-callbacks'); // Switch to My Callbacks tab
              } else {
                const error = await response.json();
                Alert.alert('Error', error.detail || 'Failed to claim callback');
              }
            } catch (error) {
              console.error('Error claiming callback:', error);
              Alert.alert('Error', 'Failed to claim callback');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (callbackId, newStatus) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/complaints/${callbackId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Status updated successfully');
        fetchAllData();
      } else {
        Alert.alert('Error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#FF6B6B',
      in_progress: '#4ECDC4',
      resolved: '#95E1D3',
      closed: '#A0AEC0',
    };
    return colors[status] || '#A0AEC0';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#FF0000',
      high: '#FF6B6B',
      medium: '#FFA500',
      low: '#4ECDC4',
    };
    return colors[priority] || '#A0AEC0';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      urgent: '🔥',
      high: '⚠️',
      medium: '📌',
      low: '📋',
    };
    return icons[priority] || '📋';
  };

  const formatTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const renderAvailableCallback = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityIcon}>{getPriorityIcon(item.priority)}</Text>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.complaintId}>{item.complaint_id}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTimeSince(item.created_at)}</Text>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer_name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.customer_phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{item.issue_type}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.claimButton}
        onPress={() => handleClaimCallback(item.id, item.title)}
      >
        <Text style={styles.claimButtonText}>✋ Pick This Job</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMyCallback = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityIcon}>{getPriorityIcon(item.priority)}</Text>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTimeSince(item.created_at)}</Text>
          <Text style={styles.dateText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer_name || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.customer_phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{item.issue_type}</Text>
        </View>
      </View>

      {item.status !== 'resolved' && item.status !== 'closed' && (
        <View style={styles.actionButtons}>
          {item.status === 'open' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]}
              onPress={() => handleUpdateStatus(item.id, 'in_progress')}
            >
              <Text style={styles.actionButtonText}>Start Work</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#95E1D3' }]}
              onPress={() => handleUpdateStatus(item.id, 'resolved')}
            >
              <Text style={styles.actionButtonText}>Mark Resolved</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  const currentData = activeTab === 'available' ? availableCallbacks : myCallbacks;

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{availableCallbacks.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myCallbacks.length}</Text>
            <Text style={styles.statLabel}>My Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {myCallbacks.filter((c) => c.status === 'in_progress').length}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available Jobs ({availableCallbacks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-callbacks' && styles.tabActive]}
          onPress={() => setActiveTab('my-callbacks')}
        >
          <Text style={[styles.tabText, activeTab === 'my-callbacks' && styles.tabTextActive]}>
            My Callbacks ({myCallbacks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={currentData}
        renderItem={
          activeTab === 'available' ? renderAvailableCallback : renderMyCallback
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'available' ? '✅' : '📋'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'available'
                ? 'No available callbacks at the moment'
                : 'No callbacks assigned to you'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4ECDC4',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  complaintId: {
    fontSize: 12,
    color: '#999',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  claimButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CallbacksScreen;
