import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetOrder,
  useUpdateOrderStatus,
  useDeleteOrder,
} from '@workspace/api-client-react';
import { StatusBadge, getStatusColor } from '@/components/StatusBadge';
import { GoldButton } from '@/components/GoldButton';
import { useAuth } from '@/context/AuthContext';

const ORDER_STATUSES = [
  { key: 'new', label: 'جديد' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'preparing', label: 'قيد التحضير' },
  { key: 'shipped', label: 'تم الشحن' },
  { key: 'delivering', label: 'جاري التوصيل' },
  { key: 'delivered', label: 'تم التسليم' },
  { key: 'cancelled', label: 'ملغي' },
  { key: 'returned', label: 'مرتجع' },
] as const;

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoValue}>{String(value)}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = parseInt(id ?? '0', 10);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const { data: order, isLoading, error } = useGetOrder(orderId);
  const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateOrderStatus();
  const { mutateAsync: deleteOrder, isPending: deleting } = useDeleteOrder();

  const handleStatusChange = async (newStatus: string) => {
    setShowStatusPicker(false);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateStatus({ id: orderId, data: { status: newStatus as any } });
      queryClient.invalidateQueries();
    } catch (e: any) {
      Alert.alert('خطأ', e?.data?.error ?? 'فشل تحديث الحالة');
    }
  };

  const handleDelete = () => {
    Alert.alert('حذف الطلب', 'هل تريد حذف هذا الطلب نهائياً؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteOrder({ id: orderId });
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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8A830" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>لم يتم العثور على الطلب</Text>
      </View>
    );
  }

  function formatPrice(n: number | null | undefined) {
    if (n == null) return '—';
    return n.toLocaleString('ar-IQ') + ' د.ع';
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status hero */}
        <View style={styles.statusHero}>
          <Text style={styles.orderNum}>{order.orderNumber}</Text>
          <StatusBadge status={order.status} large />
        </View>

        {/* Customer */}
        <Section title="بيانات العميل">
          <InfoRow label="الاسم" value={order.customerName} />
          <InfoRow label="الهاتف" value={order.phone} />
          <InfoRow label="المحافظة" value={order.province} />
          <InfoRow label="القضاء" value={order.district} />
          <InfoRow label="العنوان" value={order.address} />
        </Section>

        {/* Product */}
        <Section title="تفاصيل المنتج">
          <InfoRow label="المنتج" value={order.productName} />
          <InfoRow label="الكمية" value={order.quantity} />
          <InfoRow label="سعر البيع" value={formatPrice(order.salePrice)} />
          <InfoRow label="طريقة الدفع" value={order.paymentMethod} />
        </Section>

        {/* Shipping */}
        <Section title="الشحن">
          <InfoRow label="شركة التوصيل" value={order.deliveryCompany} />
          <InfoRow label="رقم التتبع" value={order.trackingNumber} />
          <InfoRow label="المسوقة" value={order.marketerName} />
        </Section>

        {/* Financial */}
        {isAdmin && (order.marketerProfit != null || order.companyProfit != null) && (
          <Section title="المالية">
            <InfoRow label="ربح المسوقة" value={formatPrice(order.marketerProfit)} />
            <InfoRow label="ربح الشركة" value={formatPrice(order.companyProfit)} />
          </Section>
        )}

        {order.notes && (
          <Section title="ملاحظات">
            <Text style={styles.notes}>{order.notes}</Text>
          </Section>
        )}

        {/* Status change */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>تغيير الحالة</Text>

          {!showStatusPicker ? (
            <GoldButton
              title="تغيير الحالة"
              onPress={() => setShowStatusPicker(true)}
              variant="secondary"
            />
          ) : (
            <View style={styles.statusGrid}>
              {ORDER_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[
                    styles.statusOption,
                    order.status === s.key && styles.statusOptionActive,
                    { borderColor: getStatusColor(s.key) + '66' },
                  ]}
                  onPress={() => handleStatusChange(s.key)}
                  disabled={updatingStatus}
                >
                  <Text style={[styles.statusOptionLabel, { color: getStatusColor(s.key) }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Admin actions */}
        {isAdmin && (
          <View style={styles.adminActions}>
            <GoldButton
              title="تعديل الطلب"
              onPress={() => router.push({ pathname: '/order/new', params: { editId: String(orderId) } })}
              style={{ flex: 1 }}
            />
            <GoldButton
              title="حذف"
              onPress={handleDelete}
              variant="danger"
              loading={deleting}
              style={{ flex: 0.4 }}
            />
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
  statusHero: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 20,
    alignItems: 'flex-end',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 10,
  },
  orderNum: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#E8A830', letterSpacing: 1 },
  section: { marginBottom: 12 },
  sectionTitle: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#F2F2F2', textAlign: 'right', marginBottom: 8 },
  sectionCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 12,
  },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#666' },
  infoValue: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#F2F2F2', textAlign: 'right', flex: 1, marginRight: 8 },
  notes: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#F2F2F2', textAlign: 'right', lineHeight: 22 },
  actionsSection: { marginBottom: 12 },
  statusGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#141414',
  },
  statusOptionActive: { backgroundColor: '#1A1508' },
  statusOptionLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 13 },
  adminActions: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
  errorText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: '#D93030' },
});
