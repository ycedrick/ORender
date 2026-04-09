import { Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progressPercentage: number;
  totalCompletedHours: number;
  requiredHours: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progressPercentage,
  totalCompletedHours,
  requiredHours,
  size = 220,
  strokeWidth = 14,
}) => {
  const { theme } = useTheme();

  // Radius and Circumference
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Animated value for the ring
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    // Animate to the actual progress percentage (0 to 1)
    const targetProgress = Math.min(Math.max(progressPercentage / 100, 0), 1);
    animatedProgress.value = withTiming(targetProgress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progressPercentage]);

  // Animated props for the colored SVG circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Track */}
        <Circle
          stroke={theme.colors.border.subtle}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Foreground Progress */}
        <AnimatedCircle
          stroke={theme.colors.action.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>

      <View style={styles.content}>
        <VStack align="center" spacing="xs">
          <Text variant="display" weight="bold" style={styles.hoursText}>
            {totalCompletedHours.toFixed(1)}
          </Text>
          <Text variant="sm" color={theme.colors.text.secondary}>
            / {requiredHours} hrs total
          </Text>
        </VStack>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursText: {
    lineHeight: 48,
  }
});
