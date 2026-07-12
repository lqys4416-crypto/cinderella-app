import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  ActivityIndicator, Platform, Switch,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@workspace/api-client-react';
import { InputField } from '@/components/InputField';
import { GoldButton } from '@/components/GoldButton';
import { useAuth } from '@/context/AuthContext';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoValue}>{String(value ?? '—')}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseInt(id ?? '0', 10);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);

  const { data: product, isLoading } = useGetProduct(productId);
  const { mutateAsync: updateProduct, isPending: updating } = useUpdateProduct();
  const { mutateAsync: deleteProduct, isPending: deleting } = useDeleteProduct();

  const [form, setForm] = useState({ name: '', price: '', profit: '', quantity: '', description: '', status: 'active' as 'active' | 'inactive' });

  React.useEffect(() => {
    if (product && !editing) {
      setForm({
        name: product.name,
        price: String(product.price),
        profit: String(product.profit),
        quantity: String(product.quantity),
        description: product.description ?? '',
        status: product.status as 'active' | 'inactive',
      });
    }
  }, [product]);

  const handleSave = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateProduct({
        id: productId,
        data: {
          name: form.name.trim(),
          price: parseFloat(form.price),
          profit: parseFloat(form.profit),
          quantity: parseInt(form.quantity, 10),
          description: form.description || null,
          status: form.status,
        },
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries();
      setEditing(false);
    } catch (e: any) {
      Alert.alert('خطأ', e?.data?.error ?? 'فشل الحفظ');
    }
  };

  const handleDelete = () => {
    Alert.alert('حذف المنتج', 'سيتم حذف هذا المنتج نهائياً.', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct({ id: productId });
            queryClient.invalidateQueries();
            router.back();
          } catch (e: any) {
            Alert.alert('خطأ', e?.data?.error ?? 'فشل الحذف');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E8A830" /></View>;
  }

  if (!product) {
    return <View style={styles.center}><Text style={styles.errorText}>لم يتم العثور على المنتج</Text></View>;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="cube-outline" size={40} color="#E8A830" />
          </View>
          <Text style={styles.heroName}>{product.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: product.status === 'active' ? '#10B98122' : '#EF444422' }]}>
            <Text style={{ fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: product.status === 'active' ? '#10B981' : '#EF4444' }}>
              {product.status === 'active' ? 'نشط' : 'غير نشط'}
            </Text>
          </View>
        </View>

        {!editing ? (
          // View mode
          <View style={styles.infoCard}>
            <InfoRow label="السعر" value={product.price.toLocaleString('ar-IQ') + ' د.ع'} />
            <View style={styles.divider} />
            <InfoRow label="الربح" value={product.profit.toLocaleString('ar-IQ') + ' د.ع'} />
            <View style={styles.divider} />
            <InfoRow label="المخزون" value={product.quantity + ' قطعة'} />
            {product.description && (
              <>
                <View style={styles.divider} />
                <Text style={styles.descLabel}>الوصف</Text>
                <Text style={styles.descText}>{product.description}</Text>
              </>
            )}
          </View>
        ) : (
          // Edit mode
          <View style={styles.editSection}>
            <InputField label="اسم المنتج" value={form.name} onChangeText={(v) => setForm(f => ({ ...f, name: v }))} />
            <InputField label="السعر (د.ع)" value={form.price} onChangeText={(v) => setForm(f => ({ ...f, price: v }))} keyboardType="numeric" />
            <InputField label="الربح (د.ع)" value={form.profit} onChangeText={(v) => setForm(f => ({ ...f, profit: v }))} keyboardType="numeric" />
            <InputField label="الكمية" value={form.quantity} onChangeText={(v) => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
            <InputField label="الوصف" value={form.description} onChangeText={(v) => setForm(f => ({ ...f, description: v }))} multiline />
            <View style={styles.switchRow}>
              <Switch
                value={form.status === 'active'}
                onValueChange={(v) => setForm(f => ({ ...f, status: v ? 'active' : 'inactive' }))}
                trackColor={{ false: '#333', true: '#E8A83055' }}
                thumbColor={form.status === 'active' ? '#E8A830' : '#666'}
              />
              <Text style={styles.switchLabel}>نشط</Text>
            </View>
          </View>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <View style={styles.actions}>
            {!editing ? (
              <>
                <GoldButton title="تعديل" onPress={() => setEditing(true)} style={{ flex: 1 }} />
                <GoldButton title="حذف" onPress={handleDelete} variant="danger" loading={deleting} style={{ flex: 0.5 }} />
              </>
            ) : (
              <>
                <GoldButton title="حفظ" onPress={handleSave} loading={updating} style={{ flex: 1 }} />
                <GoldButton title="إلغاء" onPress={() => { setEditing(false); }} variant="secondary" style={{ flex: 0.5 }} />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 10,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E8A83022',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: { fontFamily: 'Cairo_700Bold', fontSize: 22, color: '#F2F2F2', textAlign: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  infoCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 12,
  },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#666' },
  infoValue: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: '#F2F2F2' },
  divider: { height: 1, backgroundColor: '#2D2516' },
  descLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: '#999', textAlign: 'right', marginBottom: 4 },
  descText: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#F2F2F2', textAlign: 'right', lineHeight: 22 },
  editSection: { marginBottom: 16 },
  switchRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 16 },
  switchLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: '#F2F2F2' },
  actions: { flexDirection: 'row-reverse', gap: 10 },
  errorText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: '#D93030' },
});
