import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Header } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

const ServiceDetailsScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [techniciansWorkload, setTechniciansWorkload] = useState({});
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [newScheduledDate, setNewScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/schedules/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setService(data);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const [techResponse, servicesResponse] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/admin/technicians`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_CONFIG.BASE_URL}/services/schedules`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (techResponse.ok && servicesResponse.ok) {
        const techData = await techResponse.json();
        const servicesData = await servicesResponse.json();

        // Extract technicians array from response (API returns {users: [...], total_count: N})
        const techList = techData.users || techData;

        // Calculate workload for each technician
        const workload = {};
        techList.forEach(tech => {
          workload[tech.id] = servicesData.filter(
            service => service.technician_id === tech.id &&
            ['pending', 'scheduled', 'in_progress'].includes(service.status?.toLowerCase())
          ).length;
        });

        setTechnicians(techList);
        setTechniciansWorkload(workload);
      } else {
        console.error('Error fetching technicians:', techResponse.status, servicesResponse.status);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleAssignTechnician = async () => {
    console.log('Assign Technician button clicked');
    await fetchTechnicians();
    setShowAssignModal(true);
  };

  const assignTechnician = async () => {
    if (!selectedTechnician) {
      alert('Please select a technician');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/schedules/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technician_id: selectedTechnician.id,
          status: 'scheduled' // Update status to scheduled when technician is assigned
        }),
      });

      if (response.ok) {
        setShowAssignModal(false);
        setSelectedTechnician(null);
        fetchServiceDetails(); // Refresh service data
      } else {
        alert('Failed to assign technician');
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Error assigning technician');
    }
  };

  const handleReschedule = () => {
    console.log('Reschedule button clicked');
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewScheduledDate(tomorrow);
    setShowDatePicker(true);
  };

  const rescheduleService = async (selectedDate) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/schedules/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduled_date: selectedDate.toISOString().split('T')[0]
        }),
      });

      if (response.ok) {
        fetchServiceDetails(); // Refresh service data
      } else {
        alert('Failed to reschedule service');
      }
    } catch (error) {
      console.error('Error rescheduling service:', error);
      alert('Error rescheduling service');
    }
  };

  const handleMarkComplete = async () => {
    if (!window.confirm('Are you sure you want to mark this service as completed?')) {
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/schedules/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        alert('Success: Service marked as completed');
        fetchServiceDetails(); // Refresh
      } else {
        alert('Error: Failed to update service status');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Error: Failed to update service');
    }
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

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Service not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Service Details"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Service Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="clipboard-check" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Service Information</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(service.status) + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                {service.status?.toUpperCase() || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Service ID</Text>
            <Text style={styles.value}>{service.service_id || service.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer Name</Text>
            <Text style={styles.value}>{service.customer_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Job Number</Text>
            <Text style={styles.value}>{service.job_number}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Scheduled Date</Text>
            <Text style={styles.value}>{formatDate(service.scheduled_date)}</Text>
          </View>

          {service.actual_date && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Actual Date</Text>
              <Text style={styles.value}>{formatDate(service.actual_date)}</Text>
            </View>
          )}
        </Card>

        {/* Assignment */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="account-hard-hat" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Assignment</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Technician Name</Text>
            <Text style={styles.value}>{service.technician_name || 'Not Assigned'}</Text>
          </View>

          {service.route && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Route</Text>
              <Text style={styles.value}>Route {service.route}</Text>
            </View>
          )}

          {service.priority && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Priority</Text>
              <Text style={[
                styles.value,
                { color: service.priority === 'HIGH' ? theme.colors.error : theme.colors.text }
              ]}>
                {service.priority}
              </Text>
            </View>
          )}

          {service.service_type && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Service Type</Text>
              <Text style={styles.value}>{service.service_type}</Text>
            </View>
          )}
        </Card>

        {/* Additional Details */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information" size={24} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Additional Details</Text>
          </View>

          {service.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{service.notes}</Text>
            </View>
          )}

          {service.created_at && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Created Date</Text>
              <Text style={styles.value}>{formatDate(service.created_at)}</Text>
            </View>
          )}
        </Card>

        {/* Action Buttons */}
        {service.status?.toUpperCase() !== 'COMPLETED' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAssignTechnician}>
              <Icon name="account-plus" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Assign Technician</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleReschedule}>
              <Icon name="calendar-clock" size={20} color={theme.colors.primary} />
              <Text style={styles.secondaryButtonText}>Reschedule</Text>
            </TouchableOpacity>

            {service.status?.toUpperCase() === 'IN_PROGRESS' && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleMarkComplete}>
                <Icon name="check-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Assign Technician Modal */}
      <Modal
        visible={showAssignModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAssignModal(false);
          setSelectedTechnician(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowAssignModal(false);
            setSelectedTechnician(null);
          }}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setShowAssignModal(false);
                  setSelectedTechnician(null);
                }}
              >
                <Icon name="arrow-left" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Assign Technician</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAssignModal(false);
                  setSelectedTechnician(null);
                }}
              >
                <Icon name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.techniciansList}>
              {technicians.map((tech) => (
                <TouchableOpacity
                  key={tech.id}
                  style={[
                    styles.technicianItem,
                    selectedTechnician?.id === tech.id && styles.technicianItemSelected
                  ]}
                  onPress={() => setSelectedTechnician(tech)}
                >
                  <Icon
                    name={selectedTechnician?.id === tech.id ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color={selectedTechnician?.id === tech.id ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <View style={styles.technicianInfo}>
                    <Text style={styles.technicianName}>{tech.name}</Text>
                    <Text style={styles.technicianEmail}>{tech.email}</Text>
                  </View>
                  <View style={styles.serviceCountBadge}>
                    <Text style={styles.serviceCountText}>
                      {techniciansWorkload[tech.id] || 0}
                    </Text>
                    <Text style={styles.serviceCountLabel}>services</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowAssignModal(false);
                  setSelectedTechnician(null);
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={assignTechnician}
              >
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker for Reschedule */}
      {showDatePicker && (
        <DateTimePicker
          value={newScheduledDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && event.type !== 'dismissed') {
              // Only reschedule if a future date was selected
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              selectedDate.setHours(0, 0, 0, 0);

              if (selectedDate >= today) {
                rescheduleService(selectedDate);
              } else {
                alert('Please select a future date');
              }
            }
          }}
        />
      )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  techniciansList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  technicianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  technicianItemSelected: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  technicianInfo: {
    marginLeft: 12,
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  technicianEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  serviceCountBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
  },
  serviceCountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  serviceCountLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceDetailsScreen;
