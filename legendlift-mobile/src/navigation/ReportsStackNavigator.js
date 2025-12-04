import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import report screens
import ReportsScreen from '../screens/admin/ReportsScreen';
import CustomerAMCReportScreen from '../screens/admin/CustomerAMCReportScreen';
import TechnicianReportScreen from '../screens/admin/TechnicianReportScreen';

const Stack = createNativeStackNavigator();

const ReportsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ReportsList" component={ReportsScreen} />
      <Stack.Screen name="CustomerAMCReport" component={CustomerAMCReportScreen} />
      <Stack.Screen name="TechnicianReport" component={TechnicianReportScreen} />
    </Stack.Navigator>
  );
};

export default ReportsStackNavigator;
