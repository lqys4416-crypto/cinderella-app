import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  Platform, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/StatCard';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/EmptyState';
import {
  useGetDashboardStats,
  useGetMarketerDashboard,
} from '@workspace/api-client-react';

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ name }: { name: string }) {
  const { data, isLoading, refetch, isRefetching } = useGetDashboardStats();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8A830" />
      </View>
    );
  }

  const stats = data;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#E8A830" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً،</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.crownIcon}>
          <Ionicons name="shield-checkmark" size={28} color="#E8A830" />
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>ملخص اليوم</Text>
      <View style={styles.statsGrid}>
        <StatCard title="طلبات اليوم" value={stats?.todayOrders ?? 0} icon="today-outline" />
        <StatCard title="طلبات الشهر" value={stats?.monthOrders ?? 0} icon="calendar-outline" iconColor="#3B82F6" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          title="الربح الكلي"
          value={(stats?.totalProfit ?? 0).toLocaleString('ar-IQ') + ' د.ع'}
          icon="cash-outline"
          iconColor="#10B981"
        />
        <StatCard title="المسوقات" value={stats?.totalMarketers ?? 0} icon="people-outline" iconColor="#8B5CF6" />
      </View>

      {/* Order status pills */}
      <Text style={styles.sectionTitle}>حالة الطلبات</Text>
      <View style={styles.pillsRow}>
        <View style={[styles.pill, { borderColor: '#E8A830' }]}>
          <Text style={[styles.pillNum, { color: '#E8A830' }]}>{stats?.newOrders ?? 0}</Text>
          <Text style={styles.pillLabel}>جديد</Text>
        </View>
        <View style={[styles.pill, { borderColor: '#10B981' }]}>
          <Text style={[styles.pillNum, { color: '#10B981' }]}>{stats?.deliveredOrders ?? 0}</Text>
          <Text style={styles.pillLabel}>مُسلَّم</Text>
        </View>
        <View style={[styles.pill, { borderColor: '#EF4444' }]}>
          <Text style={[styles.pillNum, { color: '#EF4444' }]}>{stats?.cancelledOrders ?? 0}</Text>
          <Text style={styles.pillLabel}>ملغي</Text>
        </View>
        <View style={[styles.pill, { borderColor: '#3B82F6' }]}>
          <Text style={[styles.pillNum, { color: '#3B82F6' }]}>{stats?.totalProducts ?? 0}</Text>
          <Text style={styles.pillLabel}>منتجات</Text>
        </View>
      </View>

      {/* Top Marketers */}
      {stats?.topMarketers && stats.topMarketers.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <TouchableOpacity onPress={() => router.push('/marketer')}>
              <Text style={styles.sectionLink}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>أفضل المسوقات</Text>
          </View>
          {stats.topMarketers.slice(0, 3).map((m, i) => (
            <TouchableOpacity
              key={m.id}
              style={styles.marketerRow}
              onPress={() => router.push({ pathname: '/marketer/[id]', params: { id: String(m.id) } })}
              activeOpacity={0.85}
            >
              <Text style={styles.marketerProfit}>{(m.totalProfit ?? 0).toLocaleString('ar-IQ')} د.ع</Text>
              <View style={styles.marketerInfo}>
                <Text style={styles.marketerName}>{m.name}</Text>
                <Text style={styles.marketerOrders}>{m.deliveredOrders} طلب مُسلَّم</Text>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNum}>#{i + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ─── Marketer Dashboard ───────────────────────────────────────────────────────
function MarketerDashboard({ name, balance }: { name: string; balance: number }) {
  const { data, isLoading, refetch, isRefetching } = useGetMarketerDashboard();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E8A830" />
      </View>
    );
  }

  const stats = data;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#E8A830" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً،</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.crownIcon}>
          <Ionicons name="star" size={28} color="#E8A830" />
        </View>
      </View>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>رصيدك الحالي</Text>
        <Text style={styles.balanceValue}>{balance.toLocaleString('ar-IQ')} <Text style={styles.balanceCurrency}>د.ع</Text></Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard title="إجمالي الطلبات" value={stats?.totalOrders ?? 0} icon="list-outline" />
        <StatCard title="تم التسليم" value={stats?.deliveredOrders ?? 0} icon="checkmark-circle-outline" iconColor="#10B981" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          title="إجمالي العمولات"
          value={(stats?.totalCommission ?? 0).toLocaleString('ar-IQ') + ' د.ع'}
          icon="cash-outline"
          iconColor="#E8A830"
        />
        <StatCard title="طلبات جديدة" value={stats?.newOrders ?? 0} icon="add-circle-outline" iconColor="#3B82F6" />
      </View>

      {/* Recent Orders */}
      {stats?.recentOrders && stats.recentOrders.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
              <Text style={styles.sectionLink}>عرض الكل</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>آخر الطلبات</Text>
          </View>
          {stats.recentOrders.slice(0, 5).map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </>
      )}

      {stats?.recentOrders?.length === 0 && (
        <EmptyState icon="receipt-outline" title="لا توجد طلبات بعد" subtitle="ابدأ بإضافة طلبك الأول" />
      )}
    </ScrollView>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 84 + 16 : 80;

  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: 0 }]}>
        <AdminDashboard name={user?.name ?? 'المدير'} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <MarketerDashboard name={user?.name ?? 'مسوقة'} balance={user?.balance ?? 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#999', textAlign: 'right' },
  name: { fontFamily: 'Cairo_900Black', fontSize: 24, color: '#F2F2F2', textAlign: 'right' },
  crownIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8A83022',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: { flexDirection: 'row-reverse', marginBottom: 8 },
  sectionTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
    color: '#F2F2F2',
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionLink: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#E8A830' },
  pillsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  pillNum: { fontFamily: 'Cairo_900Black', fontSize: 22 },
  pillLabel: { fontFamily: 'Cairo_400Regular', fontSize: 11, color: '#999', marginTop: 2 },
  marketerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8A83022',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNum: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#E8A830' },
  marketerInfo: { flex: 1 },
  marketerName: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: '#F2F2F2', textAlign: 'right' },
  marketerOrders: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#999', textAlign: 'right' },
  marketerProfit: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: '#10B981' },
  balanceCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8A83044',
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#999', marginBottom: 8 },
  balanceValue: { fontFamily: 'Cairo_900Black', fontSize: 36, color: '#E8A830' },
  balanceCurrency: { fontSize: 20, color: '#C48820' },
});
