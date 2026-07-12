import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Platform, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateProduct } from '@workspace/api-client-react';
import { InputField } from '@/components/InputField';
import { GoldButton } from '@/components/GoldButton';

export default function NewProductScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

  const [form, setForm] = useState({
    name: '',
    price: '',
    profit: '',
    quantity: '0',
    description: '',
    status: true, // true = active
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'مطلوب';
    if (!form.price || isNaN(parseFloat(form.price))) e.price = 'سعر غير صحيح';
    if (!form.profit || isNaN(parseFloat(form.profit))) e.profit = 'ربح غير صحيح';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createProduct({
        data: {
          name: form.name.trim(),
          price: parseFloat(form.price),
          profit: parseFloat(form.profit),
          quantity: parseInt(form.quantity, 10) || 0,
          description: form.description || null,
          status: form.status ? 'active' : 'inactive',
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries();
      router.back();
    } catch (e: any) {
      Alert.alert('خطأ', e?.data?.error ?? 'فشل إضافة المنتج');
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
          label="اسم المنتج *"
          value={form.name}
          onChangeText={set('name') as any}
          error={errors.name}
          placeholder="مثال: خلطة الأمير"
        />
        <InputField
          label="السعر (د.ع) *"
          value={form.price}
          onChangeText={set('price') as any}
          error={errors.price}
          keyboardType="numeric"
          placeholder="0"
        />
        <InputField
          label="الربح (د.ع) *"
          value={form.profit}
          onChangeText={set('profit') as any}
          error={errors.profit}
          keyboardType="numeric"
          placeholder="0"
        />
        <InputField
          label="الكمية الأولية"
          value={form.quantity}
          onChangeText={set('quantity') as any}
          keyboardType="numeric"
          placeholder="0"
        />
        <InputField
          label="الوصف"
          value={form.description}
          onChangeText={set('description') as any}
          placeholder="وصف المنتج..."
          multiline
        />

        <View style={styles.switchRow}>
          <Switch
            value={form.status}
            onValueChange={(v) => set('status')(v)}
            trackColor={{ false: '#333', true: '#E8A83055' }}
            thumbColor={form.status ? '#E8A830' : '#666'}
          />
          <Text style={styles.switchLabel}>منتج نشط</Text>
        </View>

        <GoldButton title="إضافة المنتج" onPress={handleSubmit} loading={isPending} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 16 },
  switchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  switchLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: '#F2F2F2' },
});
