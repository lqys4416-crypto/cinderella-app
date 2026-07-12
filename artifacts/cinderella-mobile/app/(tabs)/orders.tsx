import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetOrders } from '@workspace/api-client-react';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';

const STATUS_FILTERS = [
  { key: '', label: 'الكل' },
  { key: 'new', label: 'جديد' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'preparing', label: 'تحضير' },
  { key: 'shipped', label: 'شحن' },
  { key: 'delivering', label: 'توصيل' },
  { key: 'delivered', label: 'مُسلَّم' },
  { key: 'cancelled', label: 'ملغي' },
  { key: 'returned', label: 'مرتجع' },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: orders, isLoading, refetch, isRefetching } = useGetOrders({
    status: status || undefined,
    search: search.trim() || undefined,
  });

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث باسم العميل أو رقم الطلب..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, status === f.key && styles.filterChipActive]}
            onPress={() => setStatus(f.key)}
          >
            <Text style={[styles.filterLabel, status === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8A830" />
        </View>
      ) : (
        <FlatList
          data={orders ?? []}
          keyExtractor={(o) => String(o.id)}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={[styles.listContent, !(orders?.length) && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#E8A830" />}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="لا توجد طلبات"
              subtitle={search ? 'لم يتم العثور على نتائج' : 'لم تضف أي طلبات بعد'}
              actionLabel="طلب جديد"
              onAction={() => router.push('/order/new')}
            />
          }
          scrollEnabled={!!(orders?.length)}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: Platform.OS === 'web' ? 100 : 80 }]}
        onPress={() => router.push('/order/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#0D0D0D" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2516',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { paddingVertical: 2 },
  searchInput: {
    flex: 1,
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#F2F2F2',
    paddingVertical: 11,
    textAlign: 'right',
  },
  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: 'row-reverse' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2D2516',
  },
  filterChipActive: { backgroundColor: '#E8A83022', borderColor: '#E8A830' },
  filterLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 13, color: '#999' },
  filterLabelActive: { color: '#E8A830' },
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
