import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon, iconColor = '#E8A830', subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2516',
    alignItems: 'flex-end',
    minWidth: 140,
    margin: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontFamily: 'Cairo_900Black',
    fontSize: 22,
    color: '#F2F2F2',
    textAlign: 'right',
  },
  title: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 13,
    color: '#999',
    textAlign: 'right',
    marginTop: 2,
  },
  subtitle: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 12,
    color: '#E8A830',
    textAlign: 'right',
    marginTop: 4,
  },
});
