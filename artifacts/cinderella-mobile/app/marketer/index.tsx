import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetUsers } from '@workspace/api-client-react';
import { EmptyState } from '@/components/EmptyState';
import type { User } from '@workspace/api-client-react';

function MarketerCard({ user }: { user: User }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/marketer/[id]', params: { id: String(user.id) } })}
      activeOpacity={0.85}
    >
      <View style={styles.cardRow}>
        <View style={styles.infoBlock}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{user.commissionRate}%</Text>
              <Text style={styles.statLbl}>العمولة</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: '#10B981' }]}>
                {(user.balance ?? 0).toLocaleString('ar-IQ')}
              </Text>
              <Text style={styles.statLbl}>الرصيد</Text>
            </View>
          </View>
          <Text style={styles.username}>@{user.username}</Text>
        </View>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
      </View>
      <Text style={styles.name}>{user.name}</Text>
    </TouchableOpacity>
  );
}

export default function MarketersScreen() {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const { data: users, isLoading, refetch, isRefetching } = useGetUsers();

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header with back + add */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/marketer/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#0D0D0D" />
          <Text style={styles.addLabel}>إضافة</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المسوقات</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8A830" />
        </View>
      ) : (
        <FlatList
          data={users ?? []}
          keyExtractor={(u) => String(u.id)}
          renderItem={({ item }) => <MarketerCard user={item} />}
          contentContainerStyle={[styles.listContent, !(users?.length) && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#E8A830" />}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="لا توجد مسوقات"
              subtitle="أضف أول مسوقة للبدء"
              actionLabel="إضافة مسوقة"
              onAction={() => router.push('/marketer/new')}
            />
          }
          scrollEnabled={!!(users?.length)}
          showsVerticalScrollIndicator={false}
        />
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
  addLabel: { fontFamily: 'Cairo_700Bold', fontSize: 14, color: '#0D0D0D' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2D2516',
  },
  cardRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8A83022',
    borderWidth: 1.5,
    borderColor: '#E8A830',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: '#E8A830' },
  infoBlock: { flex: 1, marginLeft: 12 },
  name: { fontFamily: 'Cairo_700Bold', fontSize: 18, color: '#F2F2F2', textAlign: 'right' },
  username: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#666', textAlign: 'right', marginTop: 6 },
  statRow: { flexDirection: 'row-reverse', gap: 16 },
  stat: { alignItems: 'flex-end' },
  statVal: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#E8A830' },
  statLbl: { fontFamily: 'Cairo_400Regular', fontSize: 11, color: '#666' },
});
