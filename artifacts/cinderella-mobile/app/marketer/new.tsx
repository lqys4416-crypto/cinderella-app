import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateUser } from '@workspace/api-client-react';
import { InputField } from '@/components/InputField';
import { GoldButton } from '@/components/GoldButton';

export default function NewMarketerScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { mutateAsync: createUser, isPending } = useCreateUser();

  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    commissionRate: '25',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'مطلوب';
    if (!form.username.trim()) e.username = 'مطلوب';
    if (form.password.length < 6) e.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    const rate = parseFloat(form.commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) e.commissionRate = 'يجب أن تكون بين 0 و 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createUser({
        data: {
          name: form.name.trim(),
          username: form.username.trim(),
          password: form.password,
          commissionRate: parseFloat(form.commissionRate),
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries();
      router.back();
    } catch (e: any) {
      Alert.alert('خطأ', e?.data?.error ?? 'فشل إضافة المسوقة');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InputField
          label="الاسم الكامل *"
          value={form.name}
          onChangeText={set('name')}
          error={errors.name}
          placeholder="مثال: سارة أحمد"
        />
        <InputField
          label="اسم المستخدم *"
          value={form.username}
          onChangeText={set('username')}
          error={errors.username}
          placeholder="sara"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <InputField
          label="كلمة المرور *"
          value={form.password}
          onChangeText={set('password')}
          error={errors.password}
          secureTextEntry
          placeholder="6 أحرف على الأقل"
        />
        <InputField
          label="نسبة العمولة % *"
          value={form.commissionRate}
          onChangeText={set('commissionRate')}
          error={errors.commissionRate}
          keyboardType="numeric"
          placeholder="25"
        />

        <GoldButton title="إضافة المسوقة" onPress={handleSubmit} loading={isPending} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 16 },
});
