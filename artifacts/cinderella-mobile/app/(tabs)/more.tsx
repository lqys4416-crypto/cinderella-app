import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, iconColor = '#E8A830', danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="chevron-back-outline" size={18} color="#444" />
      <Text style={[styles.menuLabel, danger && { color: '#D93030' }]}>{label}</Text>
      <View style={[styles.menuIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={20} color={danger ? '#D93030' : iconColor} />
      </View>
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            queryClient.clear();
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: topPad }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) ?? '؟'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'admin' ? 'مدير' : 'مسوقة'}
            </Text>
          </View>
          <Text style={styles.username}>@{user?.username ?? '—'}</Text>
        </View>
      </View>

      {/* Balance (marketer only) */}
      {!isAdmin && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>الرصيد المتراكم</Text>
          <Text style={styles.balanceValue}>
            {(user?.balance ?? 0).toLocaleString('ar-IQ')} <Text style={styles.balanceCurrency}>د.ع</Text>
          </Text>
          <Text style={styles.commissionText}>نسبة العمولة: {user?.commissionRate ?? 0}%</Text>
        </View>
      )}

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>القسم الرئيسي</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="bar-chart-outline"
            label="التقارير"
            onPress={() => router.push('/reports')}
          />
          {isAdmin && (
            <>
              <View style={styles.divider} />
              <MenuItem
                icon="people-outline"
                label="إدارة المسوقات"
                onPress={() => router.push('/marketer')}
                iconColor="#8B5CF6"
              />
            </>
          )}
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>الحساب</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label="تسجيل الخروج"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>

      {/* App info */}
      <Text style={styles.version}>Cinderella Team v1.0 — نظام إدارة الفريق</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  profileCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#141414',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8A83022',
    borderWidth: 2,
    borderColor: '#E8A830',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: 'Cairo_900Black', fontSize: 28, color: '#E8A830' },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Cairo_700Bold', fontSize: 20, color: '#F2F2F2', textAlign: 'right' },
  roleBadge: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8A83022',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  roleText: { fontFamily: 'Cairo_600SemiBold', fontSize: 12, color: '#E8A830' },
  username: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#666', textAlign: 'right', marginTop: 4 },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8A83044',
    alignItems: 'center',
  },
  balanceLabel: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#999', marginBottom: 6 },
  balanceValue: { fontFamily: 'Cairo_900Black', fontSize: 30, color: '#E8A830' },
  balanceCurrency: { fontSize: 18 },
  commissionText: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#666', marginTop: 6 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 13,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2516',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { flex: 1, fontFamily: 'Cairo_600SemiBold', fontSize: 15, color: '#F2F2F2', textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#2D2516', marginHorizontal: 16 },
  version: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
});
