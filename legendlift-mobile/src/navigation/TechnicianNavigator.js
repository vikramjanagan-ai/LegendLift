import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

// Import screens
import TechnicianDashboardScreen from '../screens/technician/TechnicianDashboardScreen';
import TodayServicesScreen from '../screens/technician/TodayServicesScreen';
import ServiceHistoryScreen from '../screens/technician/ServiceHistoryScreen';
import ProfileScreen from '../screens/technician/ProfileScreen';
import AddServiceScreen from '../screens/technician/AddServiceScreen';
import ServiceDetailScreen from '../screens/technician/ServiceDetailScreen';
import CallbacksScreen from '../screens/technician/CallbacksScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Tab Navigator
const TechnicianTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Callbacks') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey600,
        tabBarStyle: {
          height: 75,
          paddingBottom: 15,
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
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={TechnicianDashboardScreen} />
      <Tab.Screen name="Services" component={TodayServicesScreen} />
      <Tab.Screen name="Callbacks" component={CallbacksScreen} />
      <Tab.Screen name="History" component={ServiceHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Root Stack Navigator for Technician (wraps tabs and modal screens)
const TechnicianNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TechnicianTabs" component={TechnicianTabs} />
      <Stack.Screen name="AddService" component={AddServiceScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
    </Stack.Navigator>
  );
};

export default TechnicianNavigator;
