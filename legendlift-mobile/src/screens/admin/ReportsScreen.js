import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Button, Header } from '../../components/common';
import { THEME as theme } from '../../constants/theme';
import { API_CONFIG } from '../../constants';

const ReportsScreen = ({ navigation }) => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportType, setReportType] = useState('daily'); // daily, monthly, yearly
  const [reportData, setReportData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    try {
      let endpoint = '';

      if (reportType === 'daily') {
        const dateStr = selectedDate.toISOString().split('T')[0];
        endpoint = `${API_CONFIG.BASE_URL}/reports/daily?date=${dateStr}`;
      } else if (reportType === 'monthly') {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        endpoint = `${API_CONFIG.BASE_URL}/reports/monthly?month=${month}&year=${year}`;
      } else if (reportType === 'yearly') {
        const year = selectedDate.getFullYear();
        endpoint = `${API_CONFIG.BASE_URL}/reports/yearly?year=${year}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const renderDailyReport = () => {
    if (!reportData) return null;

    return (
      <View>
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Daily Report - {reportData.date}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData.total_services}</Text>
              <Text style={styles.statLabel}>Total Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {reportData.completed_services}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {reportData.in_progress_services}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.error }]}>
                {reportData.pending_services}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Service Types</Text>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>Scheduled:</Text>
            <Text style={styles.typeValue}>{reportData.scheduled_services}</Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>Ad-hoc:</Text>
            <Text style={styles.typeValue}>{reportData.adhoc_services}</Text>
          </View>
        </Card>

        {reportData.technician_performance?.length > 0 && (
          <Card style={styles.statsCard}>
            <Text style={styles.cardTitle}>Technician Performance</Text>
            {reportData.technician_performance.map((tech, index) => (
              <View key={index} style={styles.techRow}>
                <Text style={styles.techName}>{tech.technician_name}</Text>
                <View style={styles.techStats}>
                  <Text style={styles.techStat}>
                    Total: {tech.total_assigned}
                  </Text>
                  <Text style={[styles.techStat, { color: theme.colors.success }]}>
                    Done: {tech.completed}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>
    );
  };

  const renderMonthlyReport = () => {
    if (!reportData) return null;

    return (
      <View>
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>
            Monthly Report - {reportData.month_name} {reportData.year}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData.total_services}</Text>
              <Text style={styles.statLabel}>Total Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {reportData.completed_services}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {reportData.completion_rate}%
              </Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                {reportData.adhoc_services}
              </Text>
              <Text style={styles.statLabel}>Ad-hoc</Text>
            </View>
          </View>
        </Card>

        {reportData.technician_performance?.length > 0 && (
          <Card style={styles.statsCard}>
            <Text style={styles.cardTitle}>Top Performers</Text>
            {reportData.technician_performance
              .sort((a, b) => b.completion_rate - a.completion_rate)
              .slice(0, 5)
              .map((tech, index) => (
                <View key={index} style={styles.techRow}>
                  <View>
                    <Text style={styles.techName}>{tech.technician_name}</Text>
                    <Text style={styles.techDetail}>
                      {tech.completed}/{tech.total_assigned} completed
                    </Text>
                  </View>
                  <Text style={[styles.completionRate,
                    tech.completion_rate >= 80 ? { color: theme.colors.success } :
                    tech.completion_rate >= 60 ? { color: theme.colors.warning } :
                    { color: theme.colors.error }
                  ]}>
                    {tech.completion_rate.toFixed(1)}%
                  </Text>
                </View>
              ))}
          </Card>
        )}
      </View>
    );
  };

  const renderYearlyReport = () => {
    if (!reportData) return null;

    return (
      <View>
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Yearly Report - {reportData.year}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData.total_services}</Text>
              <Text style={styles.statLabel}>Total Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {reportData.completed_services}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {reportData.completion_rate}%
              </Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(reportData.total_services / 12).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Avg/Month</Text>
            </View>
          </View>
        </Card>

        {reportData.monthly_breakdown?.length > 0 && (
          <Card style={styles.statsCard}>
            <Text style={styles.cardTitle}>Monthly Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartContainer}>
                {reportData.monthly_breakdown.map((month, index) => (
                  <View key={index} style={styles.monthBar}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max((month.total / reportData.total_services) * 200, 20),
                          backgroundColor: theme.colors.primary
                        }
                      ]}
                    >
                      <Text style={styles.barValue}>{month.total}</Text>
                    </View>
                    <Text style={styles.monthLabel}>{month.month_name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Card>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Service Reports"
        subtitle="View analytics and insights"
        showBack={true}
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, reportType === 'daily' && styles.activeTab]}
          onPress={() => setReportType('daily')}
        >
          <Text style={[styles.tabText, reportType === 'daily' && styles.activeTabText]}>
            Daily
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, reportType === 'monthly' && styles.activeTab]}
          onPress={() => setReportType('monthly')}
        >
          <Text style={[styles.tabText, reportType === 'monthly' && styles.activeTabText]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, reportType === 'yearly' && styles.activeTab]}
          onPress={() => setReportType('yearly')}
        >
          <Text style={[styles.tabText, reportType === 'yearly' && styles.activeTabText]}>
            Yearly
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <>
            {reportType === 'daily' && renderDailyReport()}
            {reportType === 'monthly' && renderMonthlyReport()}
            {reportType === 'yearly' && renderYearlyReport()}
          </>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loader: {
    marginTop: 50,
  },
  statsCard: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: 15,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  typeLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  typeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  techStats: {
    flexDirection: 'row',
    gap: 15,
  },
  techStat: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  techDetail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  completionRate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 20,
    gap: 10,
  },
  monthBar: {
    alignItems: 'center',
    width: 50,
  },
  bar: {
    width: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
  },
  barValue: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  monthLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
});

export default ReportsScreen;
