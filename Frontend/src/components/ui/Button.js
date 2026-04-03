import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../../theme';
import { Text } from './Text';

export const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost
    size = 'md', // sm, md, lg
    loading = false,
    disabled = false,
    iconLeft,
    iconRight,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const isPrimary = variant === 'primary';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';
    const isSecondary = variant === 'secondary';

    const baseBackgroundColor = isPrimary
        ? theme.colors.primary
        : isSecondary
            ? theme.colors.secondary
            : isOutline || isGhost
                ? 'transparent'
                : theme.colors.primary;

    const baseTextColor = isPrimary || isSecondary
        ? theme.colors.white
        : isOutline
            ? theme.colors.primary
            : theme.colors.text;

    const containerStyles = [
        styles.container,
        {
            backgroundColor: disabled ? theme.colors.textSecondary : baseBackgroundColor,
            paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
            paddingHorizontal: size === 'sm' ? 16 : 24,
            borderRadius: theme.borderRadius.md,
            borderWidth: isOutline ? 1 : 0,
            borderColor: isOutline ? theme.colors.primary : 'transparent',
            width: fullWidth ? '100%' : 'auto',
            opacity: disabled ? 0.7 : 1,
        },
        style,
    ];

    return (
        <TouchableOpacity
            style={containerStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={baseTextColor} />
            ) : (
                <View style={styles.content}>
                    {iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>}
                    <Text
                        weight="bold"
                        size={size === 'lg' ? 'lg' : 'md'}
                        style={{ color: baseTextColor, ...textStyle }}
                    >
                        {title}
                    </Text>
                    {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
});
