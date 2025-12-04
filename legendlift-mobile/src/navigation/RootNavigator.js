import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { loadStoredAuth } from '../store/slices/authSlice';
import { Loading } from '../components/common';

import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import TechnicianNavigator from './TechnicianNavigator';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('RootNavigator mounted, loading auth...');
    dispatch(loadStoredAuth())
      .then(() => console.log('Auth loaded successfully'))
      .catch((error) => console.log('Auth load error:', error));
  }, [dispatch]);

  console.log('RootNavigator render - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user);

  if (loading) {
    console.log('Showing loading screen...');
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        ) : (
          <Stack.Screen name="Technician" component={TechnicianNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
