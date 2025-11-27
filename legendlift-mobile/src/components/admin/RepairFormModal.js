import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { Input, Button } from '../common';
import { COLORS, SIZES } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const RepairFormModal = ({ visible, onClose, onSubmit, repair = null, preSelectedCustomer = null, loading = false }) => {
  const { token } = useSelector((state) => state.auth);
  const isEdit = !!repair;

  // Customer selection
  const [isExistingCustomer, setIsExistingCustomer] = useState(true);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      fetchCustomers();
      fetchTechnicians();
    }
  }, [visible]);

  useEffect(() => {
    if (repair) {
      setIsExistingCustomer(!!repair.customer_id);
      setCustomerId(repair.customer_id || '');
      setCustomerName(repair.customer_name || '');
      setContactNumber(repair.contact_number || '');
      setScheduledDate(repair.scheduled_date ? new Date(repair.scheduled_date) : new Date());
      setDescription(repair.description || '');
      setNotes(repair.notes || '');
      setStatus(repair.status || 'PENDING');
      setSelectedTechnicians(repair.technicians || []);
    } else if (preSelectedCustomer) {
      setIsExistingCustomer(true);
      setCustomerId(preSelectedCustomer.id);
    }
  }, [repair, preSelectedCustomer]);

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
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/technicians`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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
    } finally {
      setLoadingData(false);
    }
  };

  const toggleTechnician = (techId) => {
    if (selectedTechnicians.includes(techId)) {
      setSelectedTechnicians(selectedTechnicians.filter(id => id !== techId));
    } else {
      setSelectedTechnicians([...selectedTechnicians, techId]);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (isExistingCustomer) {
      if (!customerId) newErrors.customerId = 'Please select a customer';
    } else {
      if (!customerName.trim()) newErrors.customerName = 'Customer name is required';
      if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    }

    if (!scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const repairData = {
        customer_id: isExistingCustomer ? customerId : null,
        customer_name: !isExistingCustomer ? customerName.trim() : null,
        contact_number: !isExistingCustomer ? contactNumber.trim() : null,
        scheduled_date: scheduledDate.toISOString(),
        description: description.trim(),
        notes: notes.trim(),
        status,
      };

      onSubmit(repairData, selectedTechnicians);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsExistingCustomer(true);
    setCustomerId('');
    setCustomerName('');
    setContactNumber('');
    setScheduledDate(new Date());
    setDescription('');
    setNotes('');
    setStatus('PENDING');
    setSelectedTechnicians([]);
    onClose();
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Edit Repair' : 'Create Repair'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {loadingData ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : (
            <>
              {/* Customer Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>

                {!isEdit && !preSelectedCustomer && (
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Existing Customer</Text>
                    <Switch
                      value={isExistingCustomer}
                      onValueChange={setIsExistingCustomer}
                      trackColor={{ false: COLORS.grey300, true: COLORS.primaryLight }}
                      thumbColor={isExistingCustomer ? COLORS.primary : COLORS.grey400}
                    />
                  </View>
                )}

                {isExistingCustomer ? (
                  <>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.label}>Select Customer *</Text>
                      <View style={[styles.pickerWrapper, errors.customerId && styles.errorBorder]}>
                        <Picker
                          selectedValue={customerId}
                          onValueChange={setCustomerId}
                          style={styles.picker}
                          enabled={!preSelectedCustomer && !isEdit}
                        >
                          <Picker.Item label="-- Select Customer --" value="" />
                          {customers.map((customer) => (
                            <Picker.Item
                              key={customer.id}
                              label={`${customer.name} (${customer.job_number}) - ${customer.amc_status || 'INACTIVE'}`}
                              value={customer.id}
                            />
                          ))}
                        </Picker>
                      </View>
                      {errors.customerId && (
                        <Text style={styles.errorText}>{errors.customerId}</Text>
                      )}
                    </View>

                    {selectedCustomer && (
                      <View style={styles.customerInfo}>
                        <View style={styles.infoRow}>
                          <Ionicons name="location" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.infoText}>{selectedCustomer.area}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Ionicons name="call" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.infoText}>{selectedCustomer.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Ionicons name="person" size={16} color={COLORS.textSecondary} />
                          <Text style={styles.infoText}>{selectedCustomer.contact_person}</Text>
                        </View>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      label="Customer Name *"
                      value={customerName}
                      onChangeText={setCustomerName}
                      placeholder="Enter customer name"
                      error={errors.customerName}
                    />

                    <Input
                      label="Contact Number *"
                      value={contactNumber}
                      onChangeText={setContactNumber}
                      placeholder="Enter contact number"
                      keyboardType="phone-pad"
                      error={errors.contactNumber}
                    />
                  </>
                )}
              </View>

              {/* Repair Details */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Repair Details</Text>

                {/* Scheduled Date */}
                <View style={styles.dateFieldContainer}>
                  <Text style={styles.label}>Scheduled Date *</Text>
                  <TouchableOpacity
                    style={[styles.dateField, errors.scheduledDate && styles.errorBorder]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  {errors.scheduledDate && (
                    <Text style={styles.errorText}>{errors.scheduledDate}</Text>
                  )}
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (date) setScheduledDate(date);
                    }}
                  />
                )}

                <Input
                  label="Description *"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter repair description"
                  multiline
                  numberOfLines={3}
                  error={errors.description}
                />

                <Input
                  label="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter additional notes"
                  multiline
                  numberOfLines={3}
                />

                {isEdit && (
                  <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Status</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={status}
                        onValueChange={setStatus}
                        style={styles.picker}
                      >
                        <Picker.Item label="Pending" value="PENDING" />
                        <Picker.Item label="In Progress" value="IN_PROGRESS" />
                        <Picker.Item label="Completed" value="COMPLETED" />
                        <Picker.Item label="Cancelled" value="CANCELLED" />
                      </Picker>
                    </View>
                  </View>
                )}
              </View>

              {/* Technician Assignment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Assign Technicians (Unlimited) - {selectedTechnicians.length} selected
                </Text>

                {technicians.length === 0 ? (
                  <Text style={styles.emptyText}>No technicians available</Text>
                ) : (
                  technicians.map((tech) => (
                    <TouchableOpacity
                      key={tech.id}
                      style={[
                        styles.technicianCard,
                        selectedTechnicians.includes(tech.id) && styles.technicianCardSelected,
                      ]}
                      onPress={() => toggleTechnician(tech.id)}
                    >
                      <View style={styles.technicianInfo}>
                        <Ionicons
                          name={selectedTechnicians.includes(tech.id) ? 'checkbox' : 'square-outline'}
                          size={24}
                          color={selectedTechnicians.includes(tech.id) ? COLORS.primary : COLORS.grey400}
                        />
                        <View style={styles.technicianDetails}>
                          <Text style={styles.technicianName}>{tech.name}</Text>
                          {tech.phone && (
                            <Text style={styles.technicianPhone}>{tech.phone}</Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>

              {/* Submit Button */}
              <Button
                title={isEdit ? 'Update Repair' : 'Create Repair'}
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingMD,
    paddingVertical: SIZES.paddingLG,
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : SIZES.paddingLG,
  },
  closeButton: {
    padding: SIZES.paddingSM,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.paddingLG,
  },
  loader: {
    marginTop: 50,
  },
  section: {
    marginBottom: SIZES.marginXL,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginLG,
    paddingBottom: SIZES.paddingSM,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMD,
    paddingHorizontal: SIZES.paddingMD,
    backgroundColor: COLORS.grey100,
    borderRadius: SIZES.radiusSM,
    marginBottom: SIZES.marginLG,
  },
  switchLabel: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginSM,
  },
  pickerContainer: {
    marginBottom: SIZES.marginLG,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.grey300,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: SIZES.body3,
    color: COLORS.error,
    marginTop: SIZES.marginXS,
  },
  customerInfo: {
    backgroundColor: COLORS.grey100,
    padding: SIZES.paddingMD,
    borderRadius: SIZES.radiusSM,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
  },
  dateFieldContainer: {
    marginBottom: SIZES.marginLG,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.grey300,
    borderRadius: SIZES.radiusSM,
    paddingHorizontal: SIZES.paddingMD,
    paddingVertical: SIZES.paddingMD,
    backgroundColor: COLORS.white,
  },
  dateText: {
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
  },
  technicianCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey300,
    borderRadius: SIZES.radiusSM,
    padding: SIZES.paddingMD,
    marginBottom: SIZES.marginMD,
  },
  technicianCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryExtraLight,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  technicianDetails: {
    flex: 1,
  },
  technicianName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  technicianPhone: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SIZES.paddingLG,
  },
  submitButton: {
    marginTop: SIZES.marginLG,
    marginBottom: SIZES.marginXL,
  },
});

export default RepairFormModal;
