import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Header } from '../../components/common';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const ReportsScreen = ({ navigation }) => {
  const reportOptions = [
    {
      id: 1,
      title: 'Customer AMC Report',
      description: 'Complete AMC period report with services, callbacks, repairs & materials',
      icon: 'document-text',
      color: COLORS.primary,
      screen: 'CustomerAMCReport',
      premium: true,
    },
    {
      id: 2,
      title: 'Technician Performance',
      description: 'Monthly performance metrics, ratings & route coverage',
      icon: 'analytics',
      color: COLORS.success,
      screen: 'TechnicianReport',
      premium: true,
    },
    {
      id: 3,
      title: 'Materials Consumption',
      description: 'Track material usage and costs across all services',
      icon: 'cube',
      color: COLORS.warning,
      screen: 'MaterialsReport',
      premium: false,
    },
    {
      id: 4,
      title: 'Revenue Report',
      description: 'AMC revenue, collection rate & payment analysis',
      icon: 'cash',
      color: COLORS.info,
      screen: 'RevenueReport',
      premium: false,
    },
    {
      id: 5,
      title: 'Service Reports',
      description: 'Daily, weekly & monthly service completion reports',
      icon: 'bar-chart',
      color: COLORS.secondary,
      screen: 'ServiceReports',
      premium: false,
    },
  ];

  const handleReportPress = (report) => {
    if (report.screen === 'CustomerAMCReport' || report.screen === 'TechnicianReport') {
      navigation.navigate(report.screen);
    } else {
      // Placeholder for other reports
      alert(`${report.title} - Coming Soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Reports"
        subtitle="Generate detailed reports"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Ionicons name="pie-chart" size={40} color={COLORS.primary} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Advanced Reports</Text>
              <Text style={styles.headerSubtitle}>
                Comprehensive insights for your business
              </Text>
            </View>
          </View>
        </Card>

        {/* Report Options */}
        {reportOptions.map((report) => (
          <TouchableOpacity
            key={report.id}
            onPress={() => handleReportPress(report)}
            activeOpacity={0.7}
          >
            <Card style={styles.reportCard}>
              <View style={styles.reportContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: report.color + '20' },
                  ]}
                >
                  <Ionicons name={report.icon} size={28} color={report.color} />
                </View>

                <View style={styles.reportInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    {report.premium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.premiumText}>NEW</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.info} />
          <Text style={styles.infoText}>
            Select a report type to generate detailed insights. Reports can be shared or
            exported to PDF/Excel.
          </Text>
        </Card>
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
    padding: SIZES.md,
  },
  headerCard: {
    marginBottom: SIZES.md,
    padding: SIZES.lg,
    backgroundColor: COLORS.primaryLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  reportCard: {
    marginBottom: SIZES.md,
    padding: SIZES.md,
  },
  reportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radiusSM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: SIZES.xs,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSM,
    gap: 2,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.warning,
  },
  reportDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  infoCard: {
    marginTop: SIZES.md,
    padding: SIZES.md,
    flexDirection: 'row',
    gap: SIZES.sm,
    backgroundColor: COLORS.infoLight + '40',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default ReportsScreen;
