import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Header, Input, Button, Card, Loading } from '../../components/common';
import { COLORS, SIZES } from '../../constants/theme';
import axios from 'axios';
import { API_CONFIG } from '../../constants';

const ServiceCheckInScreen = ({ route, navigation }) => {
  const { customer } = route.params || {};
  const { token, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [serviceType, setServiceType] = useState('adhoc');
  const [notes, setNotes] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(customer || null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getLocation();
    if (!customer) {
      fetchCustomers();
    }
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to check-in');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable GPS');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/technician/check-in`,
        {
          customer_id: selectedCustomer.id,
          location: location,
          notes: notes || null,
          service_type: serviceType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert(
        'Success',
        `Successfully checked in!\n\nService ID: ${response.data.service_id}\nReport ID: ${response.data.report_id}`,
        [
          {
            text: 'Start Service',
            onPress: () => {
              // TODO: ExecuteService screen not yet implemented
              // navigation.navigate('ExecuteService', {
              //   serviceId: response.data.service_db_id,
              //   reportId: response.data.report_db_id,
              //   serviceDisplayId: response.data.service_id,
              //   customer: selectedCustomer,
              // });
              console.log('Execute service:', response.data.service_id);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.job_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header
        title="Service Check-In"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content}>
        {/* Location Status */}
        <Card style={styles.locationCard}>
          <View style={styles.locationRow}>
            <Ionicons
              name={location ? 'location' : 'location-outline'}
              size={24}
              color={location ? COLORS.success : COLORS.error}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location</Text>
              {location ? (
                <Text style={styles.locationText}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              ) : (
                <Text style={[styles.locationText, { color: COLORS.error }]}>
                  Location not available
                </Text>
              )}
            </View>
            {!location && (
              <TouchableOpacity onPress={getLocation}>
                <Ionicons name="refresh" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Customer Selection */}
        {!customer && (
          <>
            <Text style={styles.sectionTitle}>Select Customer</Text>
            <Input
              placeholder="Search customer..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Ionicons name="search" size={20} color={COLORS.grey600} />}
            />

            <ScrollView style={styles.customerList} nestedScrollEnabled>
              {filteredCustomers.map((cust) => (
                <Card
                  key={cust.id}
                  style={[
                    styles.customerCard,
                    selectedCustomer?.id === cust.id && styles.customerCardSelected,
                  ]}
                  onPress={() => setSelectedCustomer(cust)}
                >
                  <View style={styles.customerRow}>
                    <View style={styles.customerIcon}>
                      <Ionicons name="business" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>{cust.name}</Text>
                      <Text style={styles.customerDetails}>
                        {cust.job_number} • {cust.area}
                      </Text>
                    </View>
                    {selectedCustomer?.id === cust.id && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    )}
                  </View>
                </Card>
              ))}
            </ScrollView>
          </>
        )}

        {selectedCustomer && (
          <>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <Card>
              <View style={styles.detailRow}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCustomer.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCustomer.area}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call" size={20} color={COLORS.primary} />
                <Text style={styles.detailText}>{selectedCustomer.phone}</Text>
              </View>
            </Card>

            {/* Service Type */}
            <Text style={styles.sectionTitle}>Service Type</Text>
            <View style={styles.typeContainer}>
              {['adhoc', 'emergency', 'callback'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    serviceType === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => setServiceType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      serviceType === type && styles.typeTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <Input
              placeholder="Enter any notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            {/* Check-In Button */}
            <Button
              title="Check-In & Start Service"
              onPress={handleCheckIn}
              loading={loading}
              disabled={!location}
              fullWidth
              icon={<Ionicons name="log-in" size={20} color={COLORS.white} />}
            />
          </>
        )}
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
  locationCard: {
    marginBottom: SIZES.marginLG,
    backgroundColor: COLORS.primaryExtraLight,
    borderColor: COLORS.primaryLight,
    borderWidth: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: SIZES.marginMD,
  },
  locationLabel: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  locationText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  sectionTitle: {
    fontSize: SIZES.h6,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.marginMD,
    marginTop: SIZES.marginMD,
    lineHeight: SIZES.h6 * 1.3,
    includeFontPadding: false,
  },
  customerList: {
    maxHeight: 300,
  },
  customerCard: {
    marginBottom: SIZES.marginMD,
  },
  customerCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primaryExtraLight,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.marginMD,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
    lineHeight: SIZES.body1 * 1.3,
    includeFontPadding: false,
  },
  customerDetails: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    lineHeight: SIZES.body3 * 1.3,
    includeFontPadding: false,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginMD,
  },
  detailText: {
    fontSize: SIZES.body2,
    color: COLORS.textPrimary,
    marginLeft: SIZES.marginMD,
    lineHeight: SIZES.body2 * 1.3,
    includeFontPadding: false,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: SIZES.marginMD,
    marginBottom: SIZES.marginLG,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SIZES.paddingMD,
    borderRadius: SIZES.radiusMD,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: SIZES.body2 * 1.2,
    includeFontPadding: false,
  },
  typeTextSelected: {
    color: COLORS.white,
    lineHeight: SIZES.body2 * 1.2,
    includeFontPadding: false,
  },
});

export default ServiceCheckInScreen;
