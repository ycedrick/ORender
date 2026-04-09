import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface OjtMarkProps {
  /** Overall size of the mark in logical pixels. Defaults to 200. */
  size?: number;
}

/**
 * Animated brand mark for ORender.
 *
 * Three concentric ring segments draw themselves on with staggered timing,
 * then the entire mark slowly rotates — like a clock face coming to life.
 * A center dot pulses gently. No orbiting dots.
 */
export const OjtMark: React.FC<OjtMarkProps> = ({ size = 200 }) => {
  const { theme } = useTheme();

  // Draw-on progress for each ring (0 → 1)
  const outerDraw = useSharedValue(0);
  const middleDraw = useSharedValue(0);
  const innerDraw = useSharedValue(0);

  // Whole-mark rotation after draw-on completes
  const rotation = useSharedValue(0);

  // Center dot scale pulse
  const centerScale = useSharedValue(0);

  useEffect(() => {
    // Staggered draw-on
    outerDraw.value = withDelay(
      200,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
    middleDraw.value = withDelay(
      500,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );
    innerDraw.value = withDelay(
      750,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    // After arcs finish, start a slow continuous rotation
    rotation.value = withDelay(
      1500,
      withRepeat(
        withTiming(360, { duration: 20000, easing: Easing.linear }),
        -1,
        false,
      ),
    );

    // Center dot pops in then pulses
    centerScale.value = withDelay(
      1000,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
    );
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.04;

  const outerR = size * 0.40;
  const middleR = size * 0.29;
  const innerR = size * 0.18;

  const outerC = 2 * Math.PI * outerR;
  const middleC = 2 * Math.PI * middleR;
  const innerC = 2 * Math.PI * innerR;

  // Different arc lengths for visual interest
  const outerArc = 0.7;   // ~252°
  const middleArc = 0.55; // ~198°
  const innerArc = 0.4;   // ~144°

  const primaryColor = theme.colors.text.primary;
  const secondaryColor = theme.colors.text.secondary;
  const tertiaryColor = theme.colors.text.tertiary;

  // ── Animated SVG props ──────────────────────────────────────────────────

  const outerProps = useAnimatedProps(() => ({
    strokeDashoffset: outerC * (1 - outerDraw.value * outerArc),
  }));

  const middleProps = useAnimatedProps(() => ({
    strokeDashoffset: middleC * (1 - middleDraw.value * middleArc),
  }));

  const innerProps = useAnimatedProps(() => ({
    strokeDashoffset: innerC * (1 - innerDraw.value * innerArc),
  }));

  const centerProps = useAnimatedProps(() => {
    const r = (size * 0.035) * centerScale.value;
    const opacity = interpolate(centerScale.value, [0, 0.5, 1], [0, 0.5, 1]);
    return { r, opacity };
  });

  // Slow rotation of the entire SVG
  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={wrapperStyle}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer ring — largest, boldest */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={outerR}
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${outerC}`}
            rotation={-90}
            origin={`${cx}, ${cy}`}
            animatedProps={outerProps}
          />

          {/* Middle ring — offset rotation */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={middleR}
            stroke={secondaryColor}
            strokeWidth={strokeWidth * 0.75}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${middleC}`}
            rotation={120}
            origin={`${cx}, ${cy}`}
            animatedProps={middleProps}
          />

          {/* Inner ring — smallest, lightest */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={innerR}
            stroke={tertiaryColor}
            strokeWidth={strokeWidth * 0.6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${innerC}`}
            rotation={-30}
            origin={`${cx}, ${cy}`}
            animatedProps={innerProps}
          />

          {/* Center dot */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            fill={primaryColor}
            animatedProps={centerProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
