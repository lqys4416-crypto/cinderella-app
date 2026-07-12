import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetProducts } from '@workspace/api-client-react';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const { data: products, isLoading, refetch, isRefetching } = useGetProducts();

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المنتجات</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/product/new')}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#0D0D0D" />
            <Text style={styles.addBtnLabel}>إضافة</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats bar */}
      {products && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{products.filter(p => p.status === 'inactive').length}</Text>
            <Text style={styles.statLabel}>غير نشط</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{products.filter(p => p.status === 'active').length}</Text>
            <Text style={styles.statLabel}>نشط</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{products.length}</Text>
            <Text style={styles.statLabel}>إجمالي</Text>
          </View>
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8A830" />
        </View>
      ) : (
        <FlatList
          data={products ?? []}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={[styles.listContent, !(products?.length) && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#E8A830" />}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="لا توجد منتجات"
              subtitle="لم تضف أي منتجات بعد"
              actionLabel={isAdmin ? 'إضافة منتج' : undefined}
              onAction={isAdmin ? () => router.push('/product/new') : undefined}
            />
          }
          scrollEnabled={!!(products?.length)}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={[styles.fab, { bottom: Platform.OS === 'web' ? 100 : 80 }]}
          onPress={() => router.push('/product/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#0D0D0D" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontFamily: 'Cairo_900Black', fontSize: 24, color: '#F2F2F2' },
  addBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#E8A830',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  addBtnLabel: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#0D0D0D' },
  statsBar: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  statItem: { alignItems: 'center' },
  statNum: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#F2F2F2' },
  statLabel: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#999' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 120 },
  fab: {
    position: 'absolute',
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8A830',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E8A830',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
