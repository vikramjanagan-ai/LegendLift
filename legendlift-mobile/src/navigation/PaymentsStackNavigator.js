import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import PaymentsScreen from '../screens/admin/PaymentsScreen';
import PaymentDetailsScreen from '../screens/admin/PaymentDetailsScreen';

const Stack = createStackNavigator();

const PaymentsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="PaymentsList" component={PaymentsScreen} />
      <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
    </Stack.Navigator>
  );
};

export default PaymentsStackNavigator;
