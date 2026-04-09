import { Button, Heading, Screen, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useWelcomeScreen } from './hooks/use-welcome-screen';

const { width } = Dimensions.get('window');

/**
 * Simplistic Decorative Lines SVG
 * Renders abstract, aesthetic lines that span the width of the screen.
 */
const DecorativeLines = ({ color }: { color: string }) => (
  <View style={styles.linesContainer}>
    <Svg width={width} height="120" viewBox={`0 0 ${width} 120`} fill="none">
      <Path
        d={`M0 40 Q${width / 4} 10, ${width / 2} 40 T${width} 40`}
        stroke={color}
        strokeWidth="1.5"
        opacity="0.2"
      />
      <Path
        d={`M0 60 Q${width / 3} 90, ${width / 2} 60 T${width} 60`}
        stroke={color}
        strokeWidth="1"
        opacity="0.1"
      />
      <Path
        d={`M0 80 Q${width / 2} 50, ${width} 80`}
        stroke={color}
        strokeWidth="2"
        opacity="0.05"
      />
    </Svg>
  </View>
);

/**
 * Refactored Welcome Screen
 * Minimalist layout focusing on typography and clear action.
 */
export const WelcomeScreen = () => {
  const { theme } = useTheme();
  const { handleGetStarted } = useWelcomeScreen();

  // Entrance animations
  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) });
    contentY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.back(1)) });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  return (
    <Screen safeArea padding={false} backgroundColor={theme.colors.background}>
      <VStack fill style={styles.container}>
        <View style={styles.contentWrapper}>
          <Animated.View style={[styles.mainContent, animatedStyle]}>
            <VStack align="center" spacing="sm">
              <Text variant="sm" weight="bold" color={theme.colors.action.primary} style={styles.appName}>
                ORENDER
              </Text>
              <Heading level={1} style={styles.title}>
                Beyond tracking.
              </Heading>
            </VStack>

            <Text variant="lg" align="center" style={styles.description}>
              The more you track, the more you know. Your on-the-job training,
              simplified and visualized in one place.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="Next"
                variant="filled"
                size="lg"
                style={{ alignSelf: 'center' }}
                onPress={handleGetStarted}
              />
            </View>
          </Animated.View>
        </View>

        <DecorativeLines color={theme.colors.action.primary} />
      </VStack>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  mainContent: {
    alignItems: 'center',
    gap: 32,
  },
  appName: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.6,
  },
  title: {
    fontSize: 48,
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  description: {
    lineHeight: 28,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#0A1A33', // Deep navy
    borderRadius: 22,
    height: 54,
    width: '100%',
  },
  linesContainer: {
    width: '100%',
    height: 120,
    marginBottom: 0,
  },
});
