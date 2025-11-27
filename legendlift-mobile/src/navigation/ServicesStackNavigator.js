import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ServicesScreen from '../screens/admin/ServicesScreen';
import ServiceDetailsScreen from '../screens/admin/ServiceDetailsScreen';

const Stack = createStackNavigator();

const ServicesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ServicesList" component={ServicesScreen} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
    </Stack.Navigator>
  );
};

export default ServicesStackNavigator;
