import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function MyInput({ label, placeholder, leftIcon, ...props }) {
  return (
    <View style={styles.inputArea}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputArea: {
    width: '100%',
    marginBottom: theme.spacing.md
  },
  label: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  iconContainer: {
    marginRight: theme.spacing.xs,
  },
  input: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
});