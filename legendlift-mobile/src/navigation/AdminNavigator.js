import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

// Import screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ServicesStackNavigator from './ServicesStackNavigator';
import PaymentsStackNavigator from './PaymentsStackNavigator';
import CustomersStackNavigator from './CustomersStackNavigator';
import CallBacksStackNavigator from './CallBacksStackNavigator';
import ReportsStackNavigator from './ReportsStackNavigator';
import TechnicianManagementScreen from '../screens/admin/TechnicianManagementScreen';
import MoreScreen from '../screens/admin/MoreScreen';

const Tab = createBottomTabNavigator();

const TabNavigatorContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'CallBacks') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Technicians') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey600,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Services" component={ServicesStackNavigator} />
      <Tab.Screen name="Customers" component={CustomersStackNavigator} />
      {/* <Tab.Screen name="Payments" component={PaymentsStackNavigator} /> */}
      <Tab.Screen name="CallBacks" component={CallBacksStackNavigator} options={{ title: 'Callbacks' }} />
      <Tab.Screen name="Reports" component={ReportsStackNavigator} />
      <Tab.Screen name="Technicians" component={TechnicianManagementScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
};

const AdminNavigator = () => {
  return <TabNavigatorContent />;
};

export default AdminNavigator;
