import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CallBacksScreen from '../screens/admin/CallBacksScreen';
import CallBackDetailsScreen from '../screens/admin/CallBackDetailsScreen';

const Stack = createStackNavigator();

const CallBacksStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CallBacksList" component={CallBacksScreen} />
      <Stack.Screen name="CallBackDetails" component={CallBackDetailsScreen} />
    </Stack.Navigator>
  );
};

export default CallBacksStackNavigator;
