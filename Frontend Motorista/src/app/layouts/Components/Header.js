import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { theme } from '../../theme';

export default function Header({ title, onBack, rightComponent }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>{'<'}</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 44 }} />}

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {title === 'MOVOUT' && (
                        <View style={styles.statusContainer}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>Online</Text>
                        </View>
                    )}
                </View>

                <View style={styles.right}>
                    {rightComponent ? rightComponent : <View style={{ width: 44 }} />}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: theme.colors.primary, // Orange Header
        paddingTop: Platform.OS === 'android' ? 30 : 0,
        ...theme.shadows.sm,
        zIndex: 10,
    },
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.sm,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.white, // White back arrow on orange background
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: theme.colors.white, // White title
        letterSpacing: 2,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: -15,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.success,
        marginRight: 4,
    },
    statusText: {
        fontSize: 10,
        color: theme.colors.white,
        fontWeight: 'bold',
        opacity: 0.9,
    },
    right: {
        width: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
