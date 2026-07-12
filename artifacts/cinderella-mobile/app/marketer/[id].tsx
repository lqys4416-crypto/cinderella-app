import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { useGetUser, useUpdateUser, useDeleteUser } from '@workspace/api-client-react';
import { InputField } from '@/components/InputField';
import { GoldButton } from '@/components/GoldButton';
import { StatCard } from '@/components/StatCard';

export default function MarketerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id ?? '0', 10);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);

  const { data: user, isLoading } = useGetUser(userId);
  const { mutateAsync: updateUser, isPending: updating } = useUpdateUser();
  const { mutateAsync: deleteUser, isPending: deleting } = useDeleteUser();

  const [form, setForm] = useState({ name: '', username: '', password: '', commissionRate: '' });

  React.useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        username: user.username,
        password: '',
        commissionRate: String(user.commissionRate),
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateUser({
        id: userId,
        data: {
          name: form.name.trim(),
          username: form.username.trim(),
          commissionRate: parseFloat(form.commissionRate),
          password: form.password || null,
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
    Alert.alert('حذف المسوقة', 'هل تريد حذف هذه المسوقة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser({ id: userId });
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

  if (!user) {
    return <View style={styles.center}><Text style={styles.errorText}>لم يتم العثور على المسوقة</Text></View>;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            title="نسبة العمولة"
            value={user.commissionRate + '%'}
            icon="pie-chart-outline"
            iconColor="#8B5CF6"
          />
          <StatCard
            title="الرصيد"
            value={(user.balance ?? 0).toLocaleString('ar-IQ') + ' د.ع'}
            icon="wallet-outline"
            iconColor="#10B981"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            title="إجمالي الطلبات"
            value={user.totalOrders ?? 0}
            icon="list-outline"
          />
          <StatCard
            title="تم التسليم"
            value={user.deliveredOrders ?? 0}
            icon="checkmark-circle-outline"
            iconColor="#10B981"
          />
        </View>

        {/* Edit Form */}
        {editing && (
          <View style={styles.editCard}>
            <InputField label="الاسم" value={form.name} onChangeText={(v) => setForm(f => ({ ...f, name: v }))} />
            <InputField label="اسم المستخدم" value={form.username} onChangeText={(v) => setForm(f => ({ ...f, username: v }))} autoCapitalize="none" />
            <InputField label="كلمة المرور الجديدة (اختياري)" value={form.password} onChangeText={(v) => setForm(f => ({ ...f, password: v }))} secureTextEntry placeholder="اتركه فارغاً للإبقاء على الحالي" />
            <InputField
              label="نسبة العمولة %"
              value={form.commissionRate}
              onChangeText={(v) => setForm(f => ({ ...f, commissionRate: v }))}
              keyboardType="numeric"
              placeholder="0-100"
            />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!editing ? (
            <>
              <GoldButton title="تعديل" onPress={() => setEditing(true)} style={{ flex: 1 }} />
              <GoldButton title="حذف" onPress={handleDelete} variant="danger" loading={deleting} style={{ flex: 0.5 }} />
            </>
          ) : (
            <>
              <GoldButton title="حفظ" onPress={handleSave} loading={updating} style={{ flex: 1 }} />
              <GoldButton title="إلغاء" onPress={() => setEditing(false)} variant="secondary" style={{ flex: 0.5 }} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  content: { padding: 16 },
  profile: {
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8A83022',
    borderWidth: 2,
    borderColor: '#E8A830',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontFamily: 'Cairo_900Black', fontSize: 32, color: '#E8A830' },
  name: { fontFamily: 'Cairo_700Bold', fontSize: 22, color: '#F2F2F2' },
  username: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#666', marginTop: 4 },
  statsRow: { flexDirection: 'row-reverse', marginBottom: 8 },
  editCard: { marginTop: 16, marginBottom: 8 },
  actions: { flexDirection: 'row-reverse', gap: 10, marginTop: 16 },
  errorText: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: '#D93030' },
});
