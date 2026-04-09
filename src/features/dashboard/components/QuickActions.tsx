import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Text, HStack } from '@/components/ui';

export const QuickActions = () => {
  const { theme } = useTheme();
  const router = useRouter(); // Will be used later when routes exist

  const handleManualEntry = () => {
    router.push('/entry/manual');
  };

  const handleCreateLog = () => {
    router.push('/log/create');
  };

  const cardStyle = [
    styles.card,
    { 
      backgroundColor: theme.colors.surface.card,
      borderColor: theme.colors.border.subtle,
      borderRadius: theme.borderRadius.lg,
    }
  ];

  return (
    <View style={styles.container}>
      <Text variant="sm" weight="semibold" style={styles.title} color={theme.colors.text.secondary}>
        QUICK ACTIONS
      </Text>
      <HStack spacing="md" fill>
        <Pressable style={cardStyle} onPress={handleManualEntry}>
          <Ionicons
            name="create-outline"
            size={22}
            color={theme.colors.text.primary}
            style={styles.icon}
          />
          <Text variant="sm" weight="medium" align="center">Manual Entry</Text>
        </Pressable>
        
        <Pressable style={cardStyle} onPress={handleCreateLog}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={theme.colors.text.primary}
            style={styles.icon}
          />
          <Text variant="sm" weight="medium" align="center">Daily Log</Text>
        </Pressable>
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  title: {
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 8,
  }
});
