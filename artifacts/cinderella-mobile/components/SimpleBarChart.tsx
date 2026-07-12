import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export function SimpleBarChart({
  data,
  color = '#E8A830',
  height = 120,
  formatValue = (v) => String(v),
}: SimpleBarChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * height, 4);
          return (
            <View key={i} style={styles.barCol}>
              <Text style={styles.valueLabel} numberOfLines={1}>
                {d.value > 0 ? formatValue(d.value) : ''}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barH,
                      backgroundColor: color,
                      opacity: 0.6 + 0.4 * (d.value / max),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.labelsRow}>
        {data.map((d, i) => (
          <Text key={i} style={styles.barLabel} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  chartArea: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 24,
  },
  barCol: { flex: 1, alignItems: 'center', maxWidth: 40 },
  barTrack: { flex: 1, justifyContent: 'flex-end', width: '80%' },
  bar: { borderRadius: 4, width: '100%' },
  valueLabel: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
  },
  labelsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  barLabel: {
    flex: 1,
    fontFamily: 'Cairo_400Regular',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    maxWidth: 40,
  },
});
