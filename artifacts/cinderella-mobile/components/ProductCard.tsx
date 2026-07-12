import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@workspace/api-client-react';

interface ProductCardProps {
  product: Product;
}

function formatPrice(n: number) {
  return n.toLocaleString('ar-IQ') + ' د.ع';
}

export function ProductCard({ product }: ProductCardProps) {
  const isActive = product.status === 'active';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(product.id) } })}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="cube-outline" size={28} color="#E8A830" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.profit}>ربح: {formatPrice(product.profit)}</Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>
          <View style={styles.footer}>
            <View style={[styles.statusBadge, { backgroundColor: isActive ? '#10B98122' : '#EF444422' }]}>
              <Text style={[styles.statusLabel, { color: isActive ? '#10B981' : '#EF4444' }]}>
                {isActive ? 'نشط' : 'غير نشط'}
              </Text>
            </View>
            <Text style={styles.qty}>المخزون: {product.quantity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2D2516',
  },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E8A83022',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  name: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
    color: '#F2F2F2',
    textAlign: 'right',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: { fontFamily: 'Cairo_700Bold', fontSize: 15, color: '#E8A830' },
  profit: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#10B981' },
  footer: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 12 },
  qty: { fontFamily: 'Cairo_400Regular', fontSize: 12, color: '#666' },
});
