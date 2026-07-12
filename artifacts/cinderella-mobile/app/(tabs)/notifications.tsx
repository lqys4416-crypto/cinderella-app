import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@workspace/api-client-react';
import { EmptyState } from '@/components/EmptyState';
import type { Notification } from '@workspace/api-client-react';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  new_order: 'cart-outline',
  status_change: 'refresh-circle-outline',
  commission: 'cash-outline',
  new_product: 'cube-outline',
};

function NotifItem({ notif, onRead }: { notif: Notification; onRead: (id: number) => void }) {
  const icon = TYPE_ICONS[notif.type] ?? 'notifications-outline';

  function formatDate(d: string) {
    try {
      return new Date(d).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
  }

  return (
    <TouchableOpacity
      style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
      onPress={() => !notif.read && onRead(notif.id)}
      activeOpacity={0.85}
    >
      <View style={styles.notifContent}>
        <Text style={styles.notifMessage}>{notif.message}</Text>
        <Text style={styles.notifDate}>{formatDate(notif.createdAt)}</Text>
      </View>
      <View style={[styles.notifIconWrap, { opacity: notif.read ? 0.4 : 1 }]}>
        <Ionicons name={icon} size={22} color="#E8A830" />
        {!notif.read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const { data: notifications, isLoading, refetch, isRefetching } = useGetNotifications();
  const { mutateAsync: markRead } = useMarkNotificationRead();
  const { mutateAsync: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const handleRead = async (id: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await markRead({ id });
      queryClient.invalidateQueries();
    } catch {}
  };

  const handleMarkAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await markAllRead();
      queryClient.invalidateQueries();
    } catch {}
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll} disabled={markingAll} activeOpacity={0.8}>
            <Text style={styles.markAllBtn}>تحديد الكل كمقروء</Text>
          </TouchableOpacity>
        ) : <View />}
        <View style={styles.headerTitle}>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countNum}>{unreadCount}</Text>
            </View>
          )}
          <Text style={styles.title}>الإشعارات</Text>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8A830" />
        </View>
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(n) => String(n.id)}
          renderItem={({ item }) => <NotifItem notif={item} onRead={handleRead} />}
          contentContainerStyle={[styles.listContent, !(notifications?.length) && { flex: 1 }]}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#E8A830" />}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-off-outline"
              title="لا توجد إشعارات"
              subtitle="ستظهر الإشعارات هنا عند وجود تحديثات"
            />
          }
          scrollEnabled={!!(notifications?.length)}
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
  headerTitle: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  title: { fontFamily: 'Cairo_900Black', fontSize: 24, color: '#F2F2F2' },
  countBadge: {
    backgroundColor: '#D93030',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countNum: { fontFamily: 'Cairo_700Bold', fontSize: 12, color: '#fff' },
  markAllBtn: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#E8A830' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 120 },
  notifCard: {
    flexDirection: 'row-reverse',
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 12,
  },
  notifCardUnread: { borderColor: '#E8A83055', backgroundColor: '#1A1508' },
  notifIconWrap: { position: 'relative', paddingTop: 2 },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8A830',
  },
  notifContent: { flex: 1 },
  notifMessage: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 14,
    color: '#F2F2F2',
    textAlign: 'right',
    lineHeight: 22,
    marginBottom: 6,
  },
  notifDate: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#666', textAlign: 'right' },
});
