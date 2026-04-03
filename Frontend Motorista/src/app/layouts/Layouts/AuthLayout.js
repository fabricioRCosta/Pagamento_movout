import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { theme } from '../../theme';

export default function AuthLayout({ children }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.orangeBackground,
    justifyContent: 'center',
  },
});
