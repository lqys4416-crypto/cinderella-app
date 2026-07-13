import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  Platform, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/StatCard';
import { AssetCard } from '@/components/AssetCard';
import { EmptyState } from '@/components/EmptyState';

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ name, token }: { name: string, token: string | null }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      // Mocking stats for Asset Manager
      const response = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assets = await response.json();

      setRecentAssets(Array.isArray(assets) ? assets.slice(0, 5) : []);

      setStats({
        total: assets.length || 0,
        available: assets.filter((a: any) => a.status === 'available').length || 0,
        inUse: assets.filter((a: any) => a.status === 'in_use').length || 0,
        maintenance: assets.filter((a: any) => a.status === 'maintenance').length || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#3B82F6" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>مرحباً بك في</Text>
          <Text style={styles.name}>نظام إدارة الأصول</Text>
        </View>
        <View style={styles.adminIcon}>
          <Ionicons name="business" size={28} color="#3B82F6" />
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>نظرة عامة</Text>
      <View style={styles.statsGrid}>
        <StatCard title="إجمالي الأصول" value={stats?.total ?? 0} icon="cube-outline" iconColor="#3B82F6" />
        <StatCard title="متاح" value={stats?.available ?? 0} icon="checkmark-circle-outline" iconColor="#10B981" />
      </View>
      <View style={styles.statsGrid}>
        <StatCard title="قيد الاستخدام" value={stats?.inUse ?? 0} icon="person-outline" iconColor="#6366F1" />
        <StatCard title="تحت الصيانة" value={stats?.maintenance ?? 0} icon="build-outline" iconColor="#F59E0B" />
      </View>

      {/* Recent Assets */}
      <View style={styles.sectionRow}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/assets')}>
          <Text style={styles.sectionLink}>عرض الكل</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>أحدث الأصول</Text>
      </View>

      {recentAssets.length > 0 ? (
        recentAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))
      ) : (
        <EmptyState
          icon="cube-outline"
          title="لا توجد أصول مضافة"
          subtitle="ابدأ بإضافة أصولك لتتبعها هنا"
        />
      )}
    </ScrollView>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <AdminDashboard name={user?.name ?? 'المدير'} token={token} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontFamily: 'Cairo_400Regular', fontSize: 14, color: '#94A3B8', textAlign: 'right' },
  name: { fontFamily: 'Cairo_900Black', fontSize: 24, color: '#F8FAFC', textAlign: 'right' },
  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F622',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: { flexDirection: 'row-reverse', marginBottom: 8 },
  sectionTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
    color: '#F8FAFC',
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
  sectionLink: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#3B82F6' },
});
