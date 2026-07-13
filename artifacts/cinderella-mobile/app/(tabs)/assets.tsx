import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AssetCard } from '@/components/AssetCard';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';

export default function AssetsScreen() {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssets = async () => {
    try {
      // In a real app, this would use the generated client hooks
      // For now, we fetch from our new API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN}/api/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة الأصول</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/asset/new')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnLabel}>إضافة أصل</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      {assets.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#3B82F6' }]}>{assets.filter(a => a.status === 'in_use').length}</Text>
            <Text style={styles.statLabel}>قيد الاستخدام</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{assets.filter(a => a.status === 'available').length}</Text>
            <Text style={styles.statLabel}>متاح</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{assets.length}</Text>
            <Text style={styles.statLabel}>الإجمالي</Text>
          </View>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <AssetCard asset={item} />}
          contentContainerStyle={[styles.listContent, !(assets.length) && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAssets(); }} tintColor="#3B82F6" />}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="لا توجد أصول"
              subtitle="ابدأ بإضافة الأصول الخاصة بمؤسستك"
              actionLabel={isAdmin ? 'إضافة أصل جديد' : undefined}
              onAction={isAdmin ? () => router.push('/asset/new') : undefined}
            />
          }
          scrollEnabled={!!(assets.length)}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { bottom: Platform.OS === 'web' ? 100 : 80 }]}
          onPress={() => router.push('/asset/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Cairo_900Black', fontSize: 24, color: '#F8FAFC' },
  addBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  addBtnLabel: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#FFFFFF' },
  statsBar: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 20,
  },
  statItem: { alignItems: 'center' },
  statNum: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#F8FAFC' },
  statLabel: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#94A3B8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 120 },
  fab: {
    position: 'absolute',
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
