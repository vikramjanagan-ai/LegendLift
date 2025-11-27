import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ComplaintsScreen = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // For now, show empty state as backend endpoint not ready
      // const response = await fetch(
      //   `${API_CONFIG.BASE_URL}/complaints?customer_id=${user.customer_id}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );

      // if (response.ok) {
      //   const data = await response.json();
      //   setComplaints(data);
      // }
      setComplaints([]);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const handleSubmitComplaint = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // API endpoint will be ready soon
      Alert.alert('Success', 'Complaint submitted successfully');
      setSubject('');
      setDescription('');
      setShowForm(false);
      fetchComplaints();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED':
        return theme.colors.success;
      case 'IN_PROGRESS':
        return theme.colors.info;
      case 'OPEN':
        return theme.colors.warning;
      case 'CLOSED':
        return theme.colors.textSecondary;
      default:
        return theme.colors.warning;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderComplaintCard = (complaint) => (
    <Card key={complaint.id} style={styles.complaintCard}>
      <View style={styles.cardHeader}>
        <View style={styles.complaintInfo}>
          <Text style={styles.complaintId}>#{complaint.complaint_id}</Text>
          <Text style={styles.complaintSubject}>{complaint.subject}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(complaint.status) }]}>
            {complaint.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.complaintDescription}>{complaint.description}</Text>

      <View style={styles.complaintFooter}>
        <View style={styles.footerItem}>
          <Icon name="calendar" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.footerText}>Created: {formatDate(complaint.created_at)}</Text>
        </View>
        {complaint.resolved_at && (
          <View style={styles.footerItem}>
            <Icon name="check-circle" size={14} color={theme.colors.success} />
            <Text style={styles.footerText}>Resolved: {formatDate(complaint.resolved_at)}</Text>
          </View>
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complaints</Text>
        <Text style={styles.subtitle}>{complaints.length} complaint(s)</Text>
      </View>

      {!showForm && (
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Icon name="plus-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Raise New Complaint</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <Card style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>New Complaint</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={theme.colors.textSecondary}
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmitComplaint}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Complaint</Text>
            )}
          </TouchableOpacity>
        </Card>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : complaints.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="clipboard-check-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No complaints</Text>
            <Text style={styles.emptySubtext}>Raise a complaint if you need assistance</Text>
          </View>
        ) : (
          complaints.map(renderComplaintCard)
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 15,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  formCard: {
    margin: 15,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loader: {
    marginTop: 50,
  },
  complaintCard: {
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  complaintInfo: {
    flex: 1,
  },
  complaintId: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  complaintSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
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
  complaintDescription: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
  },
  complaintFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    gap: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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

export default ComplaintsScreen;
