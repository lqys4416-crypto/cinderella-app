import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function InputField({ label, error, secureTextEntry, style, ...props }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#666"
          secureTextEntry={isPassword && !showPassword}
          textAlign="right"
          writingDirection="rtl"
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
    color: '#F2F2F2',
    marginBottom: 6,
    textAlign: 'right',
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D2516',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: 'Cairo_400Regular',
    fontSize: 15,
    color: '#F2F2F2',
    paddingVertical: 12,
    textAlign: 'right',
  },
  inputError: { borderColor: '#D93030' },
  eyeBtn: { padding: 4 },
  errorText: {
    fontFamily: 'Cairo_400Regular',
    fontSize: 12,
    color: '#D93030',
    marginTop: 4,
    textAlign: 'right',
  },
});
