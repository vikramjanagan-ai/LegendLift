import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import { Header, Card } from '../../components/common';
import { COLORS, SIZES } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const AddServiceScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [serviceId, setServiceId] = useState('Generating...');
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    service_type: 'adhoc',
    issue_type: 'breakdown',
    notes: '',
  });

  const serviceTypes = [
    { label: 'Ad-hoc Service', value: 'adhoc' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Callback', value: 'callback' },
  ];

  const issueTypes = [
    { label: 'Breakdown', value: 'breakdown' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Inspection', value: 'inspection' },
    { label: 'Repair', value: 'repair' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    fetchCustomers();
    // Service ID will be generated when form is submitted
    setServiceId('Will be auto-generated');
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.customer_id) {
      Alert.alert('Validation Error', 'Please select a customer');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/technician/register-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          service_type: formData.service_type,
          issue_type: formData.issue_type,
          notes: formData.notes,
        }),
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        // Try to get error message
        let errorMessage = 'Failed to create service';
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } else {
          const textError = await response.text();
          console.error('Server error:', textError);
          errorMessage = `Server error: ${response.status}`;
        }
        Alert.alert('Error', errorMessage);
        return;
      }

      const data = await response.json();

      Alert.alert(
        'Success',
        `Service created successfully!\nService ID: ${data.service_id}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating service:', error);
      Alert.alert('Error', error.message || 'Failed to create service. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);

  return (
    <View style={styles.container}>
      <Header
        title="Add New Service"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Service ID Display */}
        <Card style={styles.serviceIdCard}>
          <View style={styles.serviceIdContent}>
            <Ionicons name="document-text" size={32} color={COLORS.primary} />
            <View style={styles.serviceIdInfo}>
              <Text style={styles.serviceIdLabel}>Service ID</Text>
              <Text style={styles.serviceIdValue}>{serviceId}</Text>
              <Text style={styles.serviceIdHint}>
                ID will be generated automatically
              </Text>
            </View>
          </View>
        </Card>

        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Customer <Text style={styles.required}>*</Text>
          </Text>
          {loadingCustomers ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.customer_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, customer_id: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="Select Customer" value="" />
                {customers.map((customer) => (
                  <Picker.Item
                    key={customer.id}
                    label={`${customer.name} - ${customer.area}`}
                    value={customer.id}
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* Selected Customer Details */}
          {selectedCustomer && (
            <Card style={styles.customerCard}>
              <View style={styles.customerDetail}>
                <Ionicons name="business" size={16} color={COLORS.textSecondary} />
                <Text style={styles.customerDetailText}>{selectedCustomer.name}</Text>
              </View>
              <View style={styles.customerDetail}>
                <Ionicons name="location" size={16} color={COLORS.textSecondary} />
                <Text style={styles.customerDetailText}>{selectedCustomer.address}</Text>
              </View>
              <View style={styles.customerDetail}>
                <Ionicons name="call" size={16} color={COLORS.textSecondary} />
                <Text style={styles.customerDetailText}>{selectedCustomer.phone}</Text>
              </View>
            </Card>
          )}
        </View>

        {/* Service Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Service Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.service_type}
              onValueChange={(value) =>
                setFormData({ ...formData, service_type: value })
              }
              style={styles.picker}
            >
              {serviceTypes.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Issue Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Type of Issue</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.issue_type}
              onValueChange={(value) =>
                setFormData({ ...formData, issue_type: value })
              }
              style={styles.picker}
            >
              {issueTypes.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Comments/Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Comments</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter service details, issues, or special instructions..."
            placeholderTextColor={COLORS.grey400}
            value={formData.notes}
            onChangeText={(value) => setFormData({ ...formData, notes: value })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Create Service</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.paddingMD,
  },
  serviceIdCard: {
    marginBottom: SIZES.marginLG,
  },
  serviceIdContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIdInfo: {
    flex: 1,
    marginLeft: SIZES.marginMD,
  },
  serviceIdLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  serviceIdValue: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    lineHeight: SIZES.h4 * 1.3,
    includeFontPadding: false,
  },
  serviceIdHint: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: SIZES.caption * 1.3,
    includeFontPadding: false,
  },
  section: {
    marginBottom: SIZES.marginLG,
  },
  label: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginSM,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  required: {
    color: COLORS.error,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.grey200,
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    padding: SIZES.paddingLG,
    alignItems: 'center',
  },
  customerCard: {
    marginTop: SIZES.marginMD,
    backgroundColor: COLORS.grey50,
  },
  customerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginSM,
  },
  customerDetailText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginLeft: SIZES.marginSM,
    flex: 1,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  textArea: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMD,
    borderWidth: 1,
    borderColor: COLORS.grey200,
    padding: SIZES.paddingMD,
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
    minHeight: 120,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusMD,
    padding: SIZES.paddingLG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.marginMD,
    marginBottom: SIZES.marginXL,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SIZES.marginSM,
    lineHeight: SIZES.h6 * 1.2,
    includeFontPadding: false,
  },
});

export default AddServiceScreen;
