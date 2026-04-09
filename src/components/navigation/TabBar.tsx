import { useTheme } from '@/hooks/use-theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarFilledIcon, HomeFilledIcon, PersonFilledIcon, ReportsFilledIcon } from '../../assets/icons/filled';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const getIcon = (routeName: string, isFocused: boolean) => {
    const size = 28;
    const activeColor = theme.colors.text.primary;
    const inactiveColor = theme.colors.text.tertiary;
    const iconColor = isFocused ? activeColor : inactiveColor;

    switch (routeName) {
      case 'index':
        return <HomeFilledIcon size={size} color={iconColor} />;
      case 'calendar':
        return <CalendarFilledIcon size={size} color={iconColor} />;
      case 'reports':
        return <ReportsFilledIcon size={size} color={iconColor} />;
      case 'settings':
        return <PersonFilledIcon size={size} color={iconColor} />;
      default:
        return <HomeFilledIcon size={size} color={iconColor} />;
    }
  };

  return (
    <View style={[
      styles.tabBar,
      {
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border.subtle,
        paddingBottom: Math.max(insets.bottom, 70),
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {getIcon(route.name, isFocused)}
            </View>
            {/* Minimal line indicator for active state (Threads inspired) */}
            {isFocused && (
              <View style={[styles.indicator, { backgroundColor: theme.colors.text.primary }]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
  },
  indicator: {
    position: 'absolute',
    bottom: -16, // Push to the bottom edge
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  }
});
