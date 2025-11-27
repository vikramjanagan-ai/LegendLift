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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { API_CONFIG } from '../../constants';

const AdminComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const token = useSelector((state) => state.auth.token);

  // New complaint form state
  const [newComplaint, setNewComplaint] = useState({
    customer_id: '',
    title: '',
    description: '',
    issue_type: 'technical',
    priority: 'medium',
  });

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/customers/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/technicians`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTechnicians(Array.isArray(data) ? data : (data.users || []));
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setTechnicians([]);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/complaints/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Apply custom sorting: Status -> Priority -> Time
        const statusOrder = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

        const sorted = data.sort((a, b) => {
          // First by status
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) return statusDiff;

          // Then by priority
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;

          // Finally by created_at (oldest first for open/in_progress, newest first for resolved/closed)
          if (a.status === 'open' || a.status === 'in_progress') {
            return new Date(a.created_at) - new Date(b.created_at);
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setComplaints(sorted);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchCustomers();
    fetchTechnicians();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComplaints();
  }, []);

  const handleCreateComplaint = async () => {
    if (!newComplaint.customer_id || !newComplaint.title || !newComplaint.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/complaints/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newComplaint),
      });

      if (response.ok) {
        Alert.alert('Success', 'Callback created successfully');
        setShowCreateModal(false);
        setNewComplaint({
          customer_id: '',
          title: '',
          description: '',
          issue_type: 'technical',
          priority: 'medium',
        });
        fetchComplaints();
      } else {
        Alert.alert('Error', 'Failed to create callback');
      }
    } catch (error) {
      console.error('Error creating complaint:', error);
      Alert.alert('Error', 'Failed to create callback');
    }
  };

  const handleAssignTechnician = async (complaintId, technicianId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assigned_to_id: technicianId,
          status: 'in_progress'
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Technician assigned successfully');
        fetchComplaints();
      } else {
        Alert.alert('Error', 'Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      Alert.alert('Error', 'Failed to assign technician');
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

  const getFilteredComplaints = () => {
    return complaints.filter((complaint) => {
      const statusMatch = statusFilter === 'all' || complaint.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  };

  const renderComplaintCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.complaintId}>{item.complaint_id}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>{item.priority.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.timeText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Customer:</Text>
        <Text style={styles.value}>{item.customer_name || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{item.issue_type}</Text>
      </View>

      {item.assigned_technician_name && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Assigned to:</Text>
          <Text style={styles.value}>{item.assigned_technician_name}</Text>
        </View>
      )}

      {!item.assigned_to_id && (
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => {
            Alert.alert(
              'Assign Technician',
              'Select a technician',
              technicians.map((tech) => ({
                text: tech.name,
                onPress: () => handleAssignTechnician(item.id, tech.id),
              }))
            );
          }}
        >
          <Text style={styles.assignButtonText}>Assign Technician</Text>
        </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Callbacks & Repairs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'open' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('open')}
          >
            <Text style={[styles.filterText, statusFilter === 'open' && styles.filterTextActive]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'in_progress' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('in_progress')}
          >
            <Text style={[styles.filterText, statusFilter === 'in_progress' && styles.filterTextActive]}>
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'resolved' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('resolved')}
          >
            <Text style={[styles.filterText, statusFilter === 'resolved' && styles.filterTextActive]}>
              Resolved
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Complaints List */}
      <FlatList
        data={getFilteredComplaints()}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No callbacks found</Text>
          </View>
        }
      />

      {/* Create Complaint Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Callback</Text>

            <ScrollView>
              <Text style={styles.inputLabel}>Customer *</Text>
              <ScrollView style={styles.customerPicker} nestedScrollEnabled>
                {customers.map((customer) => (
                  <TouchableOpacity
                    key={customer.id}
                    style={[
                      styles.customerOption,
                      newComplaint.customer_id === customer.id && styles.customerOptionSelected,
                    ]}
                    onPress={() =>
                      setNewComplaint({ ...newComplaint, customer_id: customer.id })
                    }
                  >
                    <Text style={styles.customerOptionText}>
                      {customer.name} - {customer.job_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newComplaint.title}
                onChangeText={(text) =>
                  setNewComplaint({ ...newComplaint, title: text })
                }
                placeholder="Brief description"
              />

              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newComplaint.description}
                onChangeText={(text) =>
                  setNewComplaint({ ...newComplaint, description: text })
                }
                placeholder="Detailed description"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.inputLabel}>Issue Type</Text>
              <View style={styles.pickerRow}>
                {['technical', 'service', 'billing', 'other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerButton,
                      newComplaint.issue_type === type && styles.pickerButtonActive,
                    ]}
                    onPress={() =>
                      setNewComplaint({ ...newComplaint, issue_type: type })
                    }
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        newComplaint.issue_type === type && styles.pickerButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.pickerRow}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.pickerButton,
                      newComplaint.priority === priority && styles.pickerButtonActive,
                    ]}
                    onPress={() =>
                      setNewComplaint({ ...newComplaint, priority: priority })
                    }
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        newComplaint.priority === priority && styles.pickerButtonTextActive,
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateComplaint}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
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
  complaintId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  assignButton: {
    marginTop: 12,
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  customerPicker: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  customerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  customerOptionSelected: {
    backgroundColor: '#E8F8F5',
  },
  customerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 8,
  },
  pickerButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  pickerButtonText: {
    color: '#666',
    fontSize: 14,
  },
  pickerButtonTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: '#F0F0F0',
  },
  modalButtonPrimary: {
    backgroundColor: '#4ECDC4',
  },
  modalButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
  },
});

export default AdminComplaintsScreen;
