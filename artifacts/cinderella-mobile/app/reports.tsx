import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetReports } from '@workspace/api-client-react';
import { StatCard } from '@/components/StatCard';
import { SimpleBarChart } from '@/components/SimpleBarChart';

const PERIODS = [
  { key: 'daily', label: 'يومي' },
  { key: 'weekly', label: 'أسبوعي' },
  { key: 'monthly', label: 'شهري' },
  { key: 'yearly', label: 'سنوي' },
] as const;

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoValue, highlight && { color: '#E8A830' }]}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('monthly');
  const { data, isLoading, refetch } = useGetReports({ period });

  return (
    <ScrollView
      style={[styles.root]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 8 },
        { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 16) + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodLabel, period === p.key && styles.periodLabelActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E8A830" />
        </View>
      ) : !data ? (
        <View style={styles.center}>
          <Text style={styles.noData}>لا توجد بيانات</Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <Text style={styles.sectionTitle}>ملخص الفترة</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="إجمالي الطلبات"
              value={data.totalOrders}
              icon="list-outline"
            />
            <StatCard
              title="تم التسليم"
              value={data.deliveredOrders}
              icon="checkmark-circle-outline"
              iconColor="#10B981"
            />
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              title="الإيرادات"
              value={(data.totalRevenue ?? 0).toLocaleString('ar-IQ') + ' د.ع'}
              icon="trending-up-outline"
              iconColor="#3B82F6"
            />
            <StatCard
              title="الأرباح"
              value={(data.totalProfit ?? 0).toLocaleString('ar-IQ') + ' د.ع'}
              icon="cash-outline"
              iconColor="#E8A830"
            />
          </View>

          {/* Details */}
          <Text style={styles.sectionTitle}>التفاصيل</Text>
          <View style={styles.detailsCard}>
            <InfoRow label="إجمالي العمولات" value={(data.totalCommissions ?? 0).toLocaleString('ar-IQ') + ' د.ع'} />
            <View style={styles.divider} />
            <InfoRow label="الطلبات الملغاة" value={String(data.cancelledOrders ?? 0)} />
            {data.bestMarketer && (
              <>
                <View style={styles.divider} />
                <InfoRow label="أفضل مسوقة" value={data.bestMarketer} highlight />
              </>
            )}
            {data.bestProduct && (
              <>
                <View style={styles.divider} />
                <InfoRow label="أكثر منتج مبيعاً" value={data.bestProduct} highlight />
              </>
            )}
            {data.bestProvince && (
              <>
                <View style={styles.divider} />
                <InfoRow label="أكثر محافظة" value={data.bestProvince} highlight />
              </>
            )}
          </View>

          {/* Chart */}
          {data.chartData && data.chartData.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>مخطط الأرباح</Text>
              <View style={styles.chartCard}>
                <SimpleBarChart
                  data={data.chartData.map((d) => ({ label: d.label, value: d.profit ?? 0 }))}
                  color="#E8A830"
                  height={100}
                  formatValue={(v) => (v / 1000).toFixed(0) + 'K'}
                />
              </View>

              <Text style={styles.sectionTitle}>مخطط الطلبات</Text>
              <View style={styles.chartCard}>
                <SimpleBarChart
                  data={data.chartData.map((d) => ({ label: d.label, value: d.orders ?? 0 }))}
                  color="#3B82F6"
                  height={100}
                />
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  content: { padding: 16 },
  periodRow: {
    flexDirection: 'row-reverse',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D2516',
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: '#E8A830' },
  periodLabel: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#999' },
  periodLabelActive: { color: '#0D0D0D' },
  sectionTitle: {
    fontFamily: 'Cairo_700Bold',
    fontSize: 18,
    color: '#F2F2F2',
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 4,
  },
  statsGrid: { flexDirection: 'row-reverse', marginBottom: 8 },
  detailsCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
    gap: 12,
  },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontFamily: 'Cairo_400Regular', fontSize: 13, color: '#666' },
  infoValue: { fontFamily: 'Cairo_600SemiBold', fontSize: 14, color: '#F2F2F2' },
  divider: { height: 1, backgroundColor: '#2D2516' },
  chartCard: {
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
  },
  center: { paddingVertical: 60, alignItems: 'center' },
  noData: { fontFamily: 'Cairo_400Regular', fontSize: 16, color: '#666' },
});
