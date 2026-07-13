import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}

export function PrimaryButton({ title, onPress, loading, disabled, variant = 'primary', style, small }: PrimaryButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bg = variant === 'primary' ? '#3B82F6' : variant === 'danger' ? '#EF4444' : '#334155';
  const fg = '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bg, opacity: disabled || loading ? 0.5 : 1 },
        small && styles.small,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg, fontSize: small ? 13 : 16 }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  label: {
    fontFamily: 'Cairo_700Bold',
  },
});
