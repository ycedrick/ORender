import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text, VStack } from '@/components/ui';

interface ClockButtonProps {
  isActive: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const ClockButton: React.FC<ClockButtonProps> = ({ 
  isActive, 
  onClockIn, 
  onClockOut,
  loading = false,
  disabled = false
}) => {
  const { theme } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;
  const glow = React.useRef(new Animated.Value(0)).current;

  const isDisabled = disabled || loading;

  const animateTo = (toValue: number, glowValue: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        speed: 22,
        bounciness: 6,
      }),
      Animated.timing(glow, {
        toValue: glowValue,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (isDisabled) return;
    if (isActive) {
      onClockOut();
    } else {
      onClockIn();
    }
  };

  // Dynamic styling based on active state
  const buttonBgColor = isActive ? theme.colors.action.danger : theme.colors.action.primary;
  const buttonTextColor = theme.colors.text.inverse;
  const buttonShadowColor = isActive ? theme.colors.action.danger : theme.colors.action.primary;

  const animatedStyle = {
    shadowOpacity: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.32],
    }),
    shadowRadius: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 18],
    }),
    elevation: glow.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 9],
    }),
  };

  const scaleStyle = {
    transform: [{ scale }],
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          {
            backgroundColor: buttonBgColor,
            shadowColor: buttonShadowColor,
            opacity: isDisabled ? 0.72 : 1,
          }
        ]}
      >
        <Animated.View style={[styles.innerButton, scaleStyle]}>
          <Pressable
            onPress={handlePress}
            onPressIn={() => animateTo(0.96, 1)}
            onPressOut={() => animateTo(1, 0)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            style={styles.pressable}
          >
            <VStack align="center" justify="center" spacing="xxs">
              {loading ? (
                <>
                  <ActivityIndicator size="small" color={buttonTextColor} />
                  <Text variant="sm" weight="medium" color={buttonTextColor} style={styles.subtitle}>
                    Processing...
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="xl" weight="bold" color={buttonTextColor}>
                    {isActive ? 'Clock Out' : 'Clock In'}
                  </Text>
                  <Text variant="sm" color={buttonTextColor} style={styles.subtitle}>
                    {isActive ? 'End your shift' : 'Start your shift'}
                  </Text>
                </>
              )}
            </VStack>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  button: {
    width: 200,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  innerButton: {
    flex: 1,
    borderRadius: 32,
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  subtitle: {
    opacity: 0.8,
  }
});
