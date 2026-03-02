import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { Text } from './Text';
import { Eye, EyeOff } from 'lucide-react-native';

export const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    error,
    leftIcon,
    rightIcon,
    keyboardType,
    autoCapitalize,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const isPassword = secureTextEntry;
    const showPasswordToggle = isPassword && value?.length > 0;

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text size="sm" weight="medium" color="textSecondary" style={styles.label}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.focused,
                    error && styles.errorBorder,
                ]}
            >
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    {...props}
                />
                {showPasswordToggle ? (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        {isPasswordVisible ? (
                            <EyeOff size={20} color={theme.colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={theme.colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                ) : (
                    rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>
                )}
            </View>
            {error && (
                <Text size="xs" color="error" style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        marginBottom: 6,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: 12,
        height: 48,
    },
    input: {
        flex: 1,
        height: '100%',
        color: theme.colors.text,
        fontSize: theme.typography.fontSizes.md,
    },
    focused: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.white,
    },
    errorBorder: {
        borderColor: theme.colors.error,
    },
    leftIcon: {
        marginRight: 10,
    },
    rightIcon: {
        marginLeft: 10,
    },
    errorText: {
        marginTop: 4,
    },
});
