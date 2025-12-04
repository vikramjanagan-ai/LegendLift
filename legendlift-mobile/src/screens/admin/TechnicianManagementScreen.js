import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const TechnicianManagementScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTechnician, setNewTechnician] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/technicians`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTechnicians(data.users || data);
      } else {
        Alert.alert('Error', 'Failed to load technicians');
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      Alert.alert('Error', 'Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnician = async () => {
    if (!newTechnician.name || !newTechnician.email || !newTechnician.phone || !newTechnician.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newTechnician.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newTechnician.phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/technicians`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTechnician),
      });

      if (response.ok) {
        Alert.alert('Success', 'Technician added successfully');
        setShowAddModal(false);
        setNewTechnician({ name: '', email: '', phone: '', password: '' });
        fetchTechnicians();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to add technician');
      }
    } catch (error) {
      console.error('Error adding technician:', error);
      Alert.alert('Error', 'Failed to add technician');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (technicianId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    Alert.alert(
      'Confirm',
      `Are you sure you want to ${action} this technician?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const endpoint = currentStatus
                ? `${API_CONFIG.BASE_URL}/admin/technicians/${technicianId}/deactivate`
                : `${API_CONFIG.BASE_URL}/admin/technicians/${technicianId}/activate`;

              const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', `Technician ${action}d successfully`);
                fetchTechnicians();
              } else {
                Alert.alert('Error', `Failed to ${action} technician`);
              }
            } catch (error) {
              console.error(`Error ${action}ing technician:`, error);
              Alert.alert('Error', `Failed to ${action} technician`);
            }
          },
        },
      ]
    );
  };

  const renderTechnicianCard = (technician) => (
    <Card key={technician.id} style={styles.techCard}>
      <View style={styles.techHeader}>
        <View style={styles.techInfo}>
          <Text style={styles.techName} numberOfLines={1} ellipsizeMode="tail">{technician.name}</Text>
          <Text style={styles.techEmail} numberOfLines={1} ellipsizeMode="tail">{technician.email}</Text>
          <Text style={styles.techPhone} numberOfLines={1}>{technician.phone}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: technician.active ? theme.colors.success : theme.colors.error }
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: technician.active ? theme.colors.success : theme.colors.error }
            ]}
          >
            {technician.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.techActions}>
        {/* Temporarily disabled - EditTechnician screen not yet implemented
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('EditTechnician', { technician })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            technician.active ? styles.deactivateButton : styles.activateButton
          ]}
          onPress={() => handleToggleActive(technician.id, technician.active)}
        >
          <Text
            style={[
              styles.actionButtonText,
              { color: technician.active ? theme.colors.error : theme.colors.success }
            ]}
          >
            {technician.active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Technician Management</Text>
          <Text style={styles.subtitle}>Manage app access</Text>
        </View>
      </View>

      <View style={styles.addButtonContainer}>
        <Button
          title="+ Add Technician"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />
      </View>

      {loading && technicians.length === 0 ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{technicians.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {technicians.filter(t => t.active).length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: theme.colors.error }]}>
                {technicians.filter(t => !t.active).length}
              </Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>

          {technicians.map(renderTechnicianCard)}
        </ScrollView>
      )}

      {/* Add Technician Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Technician</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={newTechnician.name}
                onChangeText={(text) => setNewTechnician({ ...newTechnician, name: text })}
                placeholder="Enter technician name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={newTechnician.email}
                onChangeText={(text) => setNewTechnician({ ...newTechnician, email: text })}
                placeholder="technician@example.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={newTechnician.phone}
                onChangeText={(text) => setNewTechnician({ ...newTechnician, phone: text })}
                placeholder="10-digit phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.label}>Initial Password *</Text>
              <TextInput
                style={styles.input}
                value={newTechnician.password}
                onChangeText={(text) => setNewTechnician({ ...newTechnician, password: text })}
                placeholder="Set temporary password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
              />

              <Text style={styles.helpText}>
                Note: The technician can change their password after first login
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddTechnician}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Technician</Text>
                )}
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 24 * 1.3,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    lineHeight: 14 * 1.3,
    includeFontPadding: false,
  },
  addButtonContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addButton: {
    backgroundColor: theme.colors.success,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loader: {
    marginTop: 50,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    ...theme.shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    lineHeight: 24 * 1.3,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 5,
    lineHeight: 12 * 1.3,
    includeFontPadding: false,
  },
  techCard: {
    marginBottom: 15,
  },
  techHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  techInfo: {
    flex: 1,
    marginRight: 15,
  },
  techName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 18 * 1.3,
    includeFontPadding: false,
  },
  techEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 14 * 1.3,
    includeFontPadding: false,
  },
  techPhone: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 14 * 1.3,
    includeFontPadding: false,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundLight,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 12 * 1.3,
    includeFontPadding: false,
  },
  techActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deactivateButton: {
    backgroundColor: '#fff',
    borderColor: theme.colors.error,
  },
  activateButton: {
    backgroundColor: '#fff',
    borderColor: theme.colors.success,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 20 * 1.3,
    includeFontPadding: false,
  },
  closeButton: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    lineHeight: 24 * 1.2,
    includeFontPadding: false,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginTop: 12,
    lineHeight: 14 * 1.3,
    includeFontPadding: false,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 16 * 1.3,
    includeFontPadding: false,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 15,
    fontStyle: 'italic',
    lineHeight: 12 * 1.3,
    includeFontPadding: false,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 16 * 1.2,
    includeFontPadding: false,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 16 * 1.2,
    includeFontPadding: false,
  },
});

export default TechnicianManagementScreen;
