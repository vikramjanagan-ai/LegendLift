import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import CustomersScreen from '../screens/admin/CustomersScreen';
import CustomerDetailsScreen from '../screens/admin/CustomerDetailsScreen';

const Stack = createStackNavigator();

const CustomersStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CustomersList" component={CustomersScreen} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} />
    </Stack.Navigator>
  );
};

export default CustomersStackNavigator;
