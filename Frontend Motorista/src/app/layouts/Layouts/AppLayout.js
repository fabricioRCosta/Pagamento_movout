import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import Header from '../Components/Header';
import { theme } from '../../theme';

export default function AppLayout({ children, title, scrollable = false, rightComponent, onBack }) {
  const ContentWrapper = scrollable ? ScrollView : View;
  const contentStyle = scrollable ? styles.scrollContent : styles.flexContent;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <Header title={title} rightComponent={rightComponent} onBack={onBack} />
      <ContentWrapper contentContainerStyle={scrollable ? styles.scrollContentContainer : undefined} style={contentStyle}>
        <View style={styles.innerContent}>
          {children}
        </View>
      </ContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Changed to white as requested
  },
  flexContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: theme.spacing.xl,
  },
  innerContent: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.md,
  }
});
