import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RepairsScreen from '../screens/admin/RepairsScreen';
import RepairDetailsScreen from '../screens/admin/RepairDetailsScreen';

const Stack = createStackNavigator();

const RepairsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RepairsList" component={RepairsScreen} />
      <Stack.Screen name="RepairDetails" component={RepairDetailsScreen} />
    </Stack.Navigator>
  );
};

export default RepairsStackNavigator;
