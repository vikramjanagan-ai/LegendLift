import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Input, Button } from '../common';
import { COLORS, SIZES } from '../../constants/theme';

const CustomerFormModal = ({ visible, onClose, onSubmit, customer = null, loading = false }) => {
  const isEdit = !!customer;

  // Basic Information
  const [name, setName] = useState('');
  const [siteName, setSiteName] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [route, setRoute] = useState(1);

  // AMC Information
  const [amcValidFrom, setAmcValidFrom] = useState(new Date());
  const [amcValidTo, setAmcValidTo] = useState(new Date());
  const [servicesPerYear, setServicesPerYear] = useState(12);
  const [amcAmount, setAmcAmount] = useState('');
  const [amcAmountReceived, setAmcAmountReceived] = useState('');
  const [amcStatus, setAmcStatus] = useState('ACTIVE');
  const [aiimsStatus, setAiimsStatus] = useState(false);

  // Equipment Details
  const [amcType, setAmcType] = useState('');
  const [doorType, setDoorType] = useState('');
  const [controllerType, setControllerType] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('');

  // Date pickers
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setSiteName(customer.site_name || '');
      setJobNumber(customer.job_number || '');
      setContactPerson(customer.contact_person || '');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setArea(customer.area || '');
      setRoute(customer.route || 1);

      setAmcValidFrom(customer.amc_valid_from ? new Date(customer.amc_valid_from) : new Date());
      setAmcValidTo(customer.amc_valid_to ? new Date(customer.amc_valid_to) : new Date());
      setServicesPerYear(customer.services_per_year || 12);
      setAmcAmount(customer.amc_amount?.toString() || '');
      setAmcAmountReceived(customer.amc_amount_received?.toString() || '');
      setAmcStatus(customer.amc_status || 'ACTIVE');
      setAiimsStatus(customer.aiims_status || false);

      setAmcType(customer.amc_type || '');
      setDoorType(customer.door_type || '');
      setControllerType(customer.controller_type || '');
      setNumberOfFloors(customer.number_of_floors?.toString() || '');
    }
  }, [customer]);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Customer name is required';
    if (!siteName.trim()) newErrors.siteName = 'Site name is required';
    if (!jobNumber.trim()) newErrors.jobNumber = 'Job number is required';
    if (!contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!area.trim()) newErrors.area = 'Area is required';
    if (!amcValidFrom) newErrors.amcValidFrom = 'AMC valid from date is required';
    if (!amcValidTo) newErrors.amcValidTo = 'AMC valid to date is required';
    if (!amcAmount || isNaN(amcAmount)) newErrors.amcAmount = 'Valid AMC amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const customerData = {
        name: name.trim(),
        site_name: siteName.trim(),
        job_number: jobNumber.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        area: area.trim(),
        route,

        amc_valid_from: amcValidFrom.toISOString().split('T')[0],
        amc_valid_to: amcValidTo.toISOString().split('T')[0],
        services_per_year: servicesPerYear,
        amc_amount: parseFloat(amcAmount),
        amc_amount_received: parseFloat(amcAmountReceived || 0),
        amc_status: amcStatus,
        aiims_status: aiimsStatus,

        amc_type: amcType.trim(),
        door_type: doorType.trim(),
        controller_type: controllerType.trim(),
        number_of_floors: numberOfFloors ? parseInt(numberOfFloors) : null,
      };

      onSubmit(customerData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

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
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Input
              label="Customer Name *"
              value={name}
              onChangeText={setName}
              placeholder="Enter customer name"
              error={errors.name}
            />

            <Input
              label="Site Name *"
              value={siteName}
              onChangeText={setSiteName}
              placeholder="Enter site name"
              error={errors.siteName}
            />

            <Input
              label="Job Number *"
              value={jobNumber}
              onChangeText={setJobNumber}
              placeholder="Enter job number"
              error={errors.jobNumber}
            />

            <Input
              label="Contact Person *"
              value={contactPerson}
              onChangeText={setContactPerson}
              placeholder="Enter contact person name"
              error={errors.contactPerson}
            />

            <Input
              label="Phone *"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Area *"
              value={area}
              onChangeText={setArea}
              placeholder="Enter area"
              error={errors.area}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Route *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={route}
                  onValueChange={setRoute}
                  style={styles.picker}
                >
                  <Picker.Item label="Route 1" value={1} />
                  <Picker.Item label="Route 2" value={2} />
                  <Picker.Item label="Route 3" value={3} />
                  <Picker.Item label="Route 4" value={4} />
                  <Picker.Item label="Route 5" value={5} />
                </Picker>
              </View>
            </View>
          </View>

          {/* AMC Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AMC Information</Text>

            {/* AMC Valid From */}
            <View style={styles.dateFieldContainer}>
              <Text style={styles.label}>AMC Valid From *</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowFromDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {amcValidFrom.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {errors.amcValidFrom && (
                <Text style={styles.errorText}>{errors.amcValidFrom}</Text>
              )}
            </View>

            {showFromDatePicker && (
              <DateTimePicker
                value={amcValidFrom}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowFromDatePicker(Platform.OS === 'ios');
                  if (date) setAmcValidFrom(date);
                }}
              />
            )}

            {/* AMC Valid To */}
            <View style={styles.dateFieldContainer}>
              <Text style={styles.label}>AMC Valid To *</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowToDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {amcValidTo.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {errors.amcValidTo && (
                <Text style={styles.errorText}>{errors.amcValidTo}</Text>
              )}
            </View>

            {showToDatePicker && (
              <DateTimePicker
                value={amcValidTo}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowToDatePicker(Platform.OS === 'ios');
                  if (date) setAmcValidTo(date);
                }}
              />
            )}

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Services Per Year *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={servicesPerYear}
                  onValueChange={setServicesPerYear}
                  style={styles.picker}
                >
                  <Picker.Item label="6 Services" value={6} />
                  <Picker.Item label="9 Services" value={9} />
                  <Picker.Item label="10 Services" value={10} />
                  <Picker.Item label="12 Services" value={12} />
                </Picker>
              </View>
            </View>

            <Input
              label="AMC Amount *"
              value={amcAmount}
              onChangeText={setAmcAmount}
              placeholder="Enter AMC amount"
              keyboardType="numeric"
              error={errors.amcAmount}
            />

            <Input
              label="AMC Amount Received"
              value={amcAmountReceived}
              onChangeText={setAmcAmountReceived}
              placeholder="Enter amount received"
              keyboardType="numeric"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>AMC Status *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={amcStatus}
                  onValueChange={setAmcStatus}
                  style={styles.picker}
                >
                  <Picker.Item label="Active" value="ACTIVE" />
                  <Picker.Item label="Inactive" value="INACTIVE" />
                </Picker>
              </View>
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.label}>AIIMS Status (Admin Only)</Text>
                <Text style={styles.switchDescription}>
                  Enable AIIMS functionality for this customer
                </Text>
              </View>
              <Switch
                value={aiimsStatus}
                onValueChange={setAiimsStatus}
                trackColor={{ false: COLORS.grey300, true: COLORS.primaryLight }}
                thumbColor={aiimsStatus ? COLORS.primary : COLORS.grey400}
              />
            </View>
          </View>

          {/* Equipment Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Details</Text>

            <Input
              label="AMC Type"
              value={amcType}
              onChangeText={setAmcType}
              placeholder="Enter AMC type"
            />

            <Input
              label="Door Type"
              value={doorType}
              onChangeText={setDoorType}
              placeholder="Enter door type"
            />

            <Input
              label="Controller Type"
              value={controllerType}
              onChangeText={setControllerType}
              placeholder="Enter controller type"
            />

            <Input
              label="Number of Floors"
              value={numberOfFloors}
              onChangeText={setNumberOfFloors}
              placeholder="Enter number of floors"
              keyboardType="numeric"
            />
          </View>

          {/* Submit Button */}
          <Button
            title={isEdit ? 'Update Customer' : 'Add Customer'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.paddingMD,
    paddingHorizontal: SIZES.paddingMD,
    backgroundColor: COLORS.grey100,
    borderRadius: SIZES.radiusSM,
    marginBottom: SIZES.marginMD,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: SIZES.marginMD,
  },
  switchDescription: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginTop: SIZES.marginXS,
  },
  errorText: {
    fontSize: SIZES.body3,
    color: COLORS.error,
    marginTop: SIZES.marginXS,
  },
  submitButton: {
    marginTop: SIZES.marginLG,
    marginBottom: SIZES.marginXL,
  },
});

export default CustomerFormModal;
