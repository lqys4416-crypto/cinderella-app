import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: 'جديد', color: '#E8A830' },
  confirmed: { label: 'مؤكد', color: '#3B82F6' },
  preparing: { label: 'قيد التحضير', color: '#8B5CF6' },
  shipped: { label: 'تم الشحن', color: '#F59E0B' },
  delivering: { label: 'جاري التوصيل', color: '#06B6D4' },
  delivered: { label: 'تم التسليم', color: '#10B981' },
  cancelled: { label: 'ملغي', color: '#EF4444' },
  returned: { label: 'مرتجع', color: '#6B7280' },
};

interface StatusBadgeProps {
  status: string;
  large?: boolean;
}

export function StatusBadge({ status, large }: StatusBadgeProps) {
  const info = STATUS_MAP[status] ?? { label: status, color: '#999' };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: info.color + '22', borderColor: info.color + '55' },
        large && styles.large,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: info.color }]} />
      <Text style={[styles.label, { color: info.color, fontSize: large ? 14 : 12 }]}>
        {info.label}
      </Text>
    </View>
  );
}

export function getStatusLabel(status: string): string {
  return STATUS_MAP[status]?.label ?? status;
}

export function getStatusColor(status: string): string {
  return STATUS_MAP[status]?.color ?? '#999';
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  large: { paddingVertical: 6, paddingHorizontal: 14 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: {
    fontFamily: 'Cairo_600SemiBold',
    textAlign: 'right',
  },
});
