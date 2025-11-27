import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { login, clearError } from '../../store/slices/authSlice';
import { GradientButton, ModernCard, ModernInput } from '../../components/common';
import { COLORS, SIZES, TEXT_STYLES, SHADOWS } from '../../constants/theme';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // 'admin' or 'technician'
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      dispatch(clearError());
      dispatch(login({ email, password, role }));
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradientBackground}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Logo */}
          <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/logo.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[TEXT_STYLES.h2, styles.appTitle]}>LegendLift</Text>
            <Text style={[TEXT_STYLES.subtitle, styles.appSubtitle]}>
              The future of service management
            </Text>
          </Animatable.View>

          {/* Login Card */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <ModernCard elevation="large" style={styles.loginCard}>
              {/* Role Selection Tabs */}
              <View style={styles.roleTabContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleTab,
                    role === 'admin' && styles.roleTabActive,
                  ]}
                  onPress={() => setRole('admin')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color={role === 'admin' ? COLORS.white : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      TEXT_STYLES.body2,
                      styles.roleTabText,
                      role === 'admin' && styles.roleTabTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleTab,
                    role === 'technician' && styles.roleTabActive,
                  ]}
                  onPress={() => setRole('technician')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="construct"
                    size={20}
                    color={role === 'technician' ? COLORS.white : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      TEXT_STYLES.body2,
                      styles.roleTabText,
                      role === 'technician' && styles.roleTabTextActive,
                    ]}
                  >
                    Technician
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Fields */}
              <View style={styles.formSection}>
                <ModernInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  error={errors.email}
                />

                <ModernInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                  error={errors.password}
                />

                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={[TEXT_STYLES.caption, styles.errorText]}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={[TEXT_STYLES.body2, styles.forgotPasswordText]}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <GradientButton
                title="LOGIN"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="large"
              />
            </ModernCard>
          </Animatable.View>

          {/* Demo Credentials Card */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <ModernCard variant="summary" elevation="small" style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle" size={20} color={COLORS.info} />
                <Text style={[TEXT_STYLES.body1, styles.demoTitle]}>Demo Credentials</Text>
              </View>

              <View style={styles.demoItem}>
                <View style={styles.demoBadge}>
                  <Text style={styles.demoBadgeText}>Admin</Text>
                </View>
                <View style={styles.demoInfo}>
                  <Text style={[TEXT_STYLES.caption, styles.demoLabel]}>Email</Text>
                  <Text style={[TEXT_STYLES.body2, styles.demoValue]}>
                    admin@legendlift.com
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.demoLabel]}>Password</Text>
                  <Text style={[TEXT_STYLES.body2, styles.demoValue]}>admin123</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.demoItem}>
                <View style={[styles.demoBadge, { backgroundColor: COLORS.secondaryLight }]}>
                  <Text style={styles.demoBadgeText}>Tech</Text>
                </View>
                <View style={styles.demoInfo}>
                  <Text style={[TEXT_STYLES.caption, styles.demoLabel]}>Email</Text>
                  <Text style={[TEXT_STYLES.body2, styles.demoValue]}>
                    john@legendlift.com
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.demoLabel]}>Password</Text>
                  <Text style={[TEXT_STYLES.body2, styles.demoValue]}>tech123</Text>
                </View>
              </View>
            </ModernCard>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View animation="fadeIn" duration={1000} delay={600} style={styles.footer}>
            <Text style={[TEXT_STYLES.caption, styles.footerText]}>
              © 2025 LegendLift. All rights reserved.
            </Text>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.screenPadding,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
    ...SHADOWS.large,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appTitle: {
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  appSubtitle: {
    color: COLORS.white,
    opacity: 0.9,
  },
  loginCard: {
    marginBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
  },
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.grey100,
    borderRadius: SIZES.radiusFull,
    padding: 4,
    marginBottom: SIZES.xl,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    gap: SIZES.xs,
  },
  roleTabActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.button,
  },
  roleTabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  roleTabTextActive: {
    color: COLORS.white,
  },
  formSection: {
    marginBottom: SIZES.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight + '20',
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSM,
    marginBottom: SIZES.md,
    gap: SIZES.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    flex: 1,
    color: COLORS.error,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.md,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  demoCard: {
    marginBottom: SIZES.lg,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  demoTitle: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  demoItem: {
    flexDirection: 'row',
    gap: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  demoBadge: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radiusSM,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  demoInfo: {
    flex: 1,
  },
  demoLabel: {
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  demoValue: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  footerText: {
    color: COLORS.white,
    opacity: 0.7,
  },
});

export default LoginScreen;
