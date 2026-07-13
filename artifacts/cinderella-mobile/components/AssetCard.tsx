import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export function AssetCard({ asset }: { asset: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'in_use': return '#3B82F6';
      case 'maintenance': return '#F59E0B';
      case 'retired': return '#EF4444';
      default: return '#94A3B8';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'in_use': return 'قيد الاستخدام';
      case 'maintenance': return 'صيانة';
      case 'retired': return 'خارج الخدمة';
      default: return status;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/asset/${asset.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{asset.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(asset.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(asset.status) }]}>
              {getStatusText(asset.status)}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={14} color="#94A3B8" />
            <Text style={styles.detailText}>{asset.category}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="barcode-outline" size={14} color="#94A3B8" />
            <Text style={styles.detailText}>{asset.serialNumber || 'بدون رقم تسلسلي'}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-back" size={20} color="#334155" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  content: { flex: 1, marginRight: 12 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontFamily: 'Cairo_700Bold', fontSize: 16, color: '#F8FAFC' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontFamily: 'Cairo_600SemiBold', fontSize: 11 },
  details: { flexDirection: 'row-reverse', gap: 16 },
  detailItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  detailText: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#94A3B8' },
});
