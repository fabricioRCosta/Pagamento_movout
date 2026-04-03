import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export default function Card({ children, style }) {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface, // Gray cards as requested
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Light border for better definition on white
        ...theme.shadows.sm, // Softer shadow for gray cards
        marginBottom: theme.spacing.md,
    },
});
