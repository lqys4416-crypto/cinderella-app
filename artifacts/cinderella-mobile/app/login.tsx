import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const { mutateAsync: loginMutate, isPending } = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    setError('');
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await loginMutate({ data: { username: username.trim(), password } });
      queryClient.clear();
      await login(result.token, result.user);
      router.replace('/(tabs)');
    } catch (e: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = e?.data?.error || 'بيانات غير صحيحة، يرجى المحاولة مجدداً';
      setError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: '#0F172A' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Brand */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.iconImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>ASSET MANAGER</Text>
          <Text style={styles.brandSub}>PROFESSIONAL SOLUTIONS</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>تسجيل الدخول</Text>
          <Text style={styles.cardSubtitle}>أدخل بياناتك للوصول إلى النظام</Text>

          <InputField
            label="اسم المستخدم"
            value={username}
            onChangeText={setUsername}
            placeholder="أدخل اسم المستخدم"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <InputField
            label="كلمة المرور"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton
            title="دخول"
            onPress={handleLogin}
            loading={isPending}
            style={styles.loginBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  iconImg: { width: 100, height: 100 },
  brandName: {
    fontFamily: 'Cairo_900Black',
    fontSize: 24,
    color: '#3B82F6',
    letterSpacing: 2,
  },
  brandSub: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 10,
    color: '#94A3B8',
    letterSpacing: 4,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 22,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  loginBtn: { marginTop: 8 },
});
