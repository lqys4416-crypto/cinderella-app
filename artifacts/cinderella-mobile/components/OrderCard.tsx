import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBadge } from './StatusBadge';
import type { Order } from '@workspace/api-client-react';

interface OrderCardProps {
  order: Order;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatPrice(n: number | null | undefined) {
  if (n == null) return '—';
  return n.toLocaleString('ar-IQ') + ' د.ع';
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/order/[id]', params: { id: String(order.id) } })}
      activeOpacity={0.85}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <StatusBadge status={order.status} />
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
      </View>

      {/* Customer */}
      <Text style={styles.customerName}>{order.customerName}</Text>
      <Text style={styles.phone}>{order.phone}</Text>

      {/* Product + price */}
      <View style={styles.detailRow}>
        <Text style={styles.price}>{formatPrice(order.salePrice)}</Text>
        <Text style={styles.product} numberOfLines={1}>{order.productName ?? '—'}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {order.province ? <Text style={styles.province}>{order.province}</Text> : null}
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
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
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 13,
    color: '#E8A830',
    letterSpacing: 1,
  },
  customerName: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 16,
    color: '#F2F2F2',
    textAlign: 'right',
    marginBottom: 2,
  },
  phone: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2D2516',
  },
  product: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#999',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  price: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 15,
    color: '#E8A830',
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  province: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 12,
    color: '#666',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  date: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 12,
    color: '#666',
  },
});
