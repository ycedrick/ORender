import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import {
  StyleSheet,
  View,
  ViewProps,
  ViewStyle
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ScreenProps extends ViewProps {
  /** If true, wraps content in a SafeAreaView. Defaults to true. */
  safeArea?: boolean;
  /** If true, adds top padding based on safe area. Defaults to true. */
  topPaddingSafeArea?: boolean;

  /** If true, wraps content in a ScrollView. Defaults to false. */
  scroll?: boolean;
  /** Optional background color override from theme. */
  backgroundColor?: string;
  /** If true, applies standard horizontal screen padding. Defaults to true. */
  padding?: boolean;
  /** Safe area edges to respect. Defaults to ['top', 'bottom']. */
  edges?: Edge[];
  /** Style for the inner content container. */
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  safeArea = true,
  topPaddingSafeArea = true,
  scroll = false,
  backgroundColor,
  padding = true,
  edges = ['top', 'bottom'],
  contentContainerStyle,
  ...rest
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const Container = safeArea ? SafeAreaView : View;
  const Wrapper = scroll ? KeyboardAwareScrollView : View;

  const resolvedBgColor = backgroundColor || theme.colors.background;

  const containerStyle = [
    styles.container,
    { backgroundColor: resolvedBgColor },
    style,
  ];

  const innerStyle = [
    padding && {
      paddingHorizontal: theme.layout.screenPaddingHorizontal,
    },
    contentContainerStyle,
  ];

  return (
    <Container
      style={containerStyle}
      edges={safeArea ? edges : undefined}
      {...rest}
    >
      <Wrapper
        style={[styles.wrapper, { backgroundColor: resolvedBgColor }, topPaddingSafeArea && { paddingTop: insets.top }]}
        contentContainerStyle={scroll ? innerStyle : undefined}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...scroll && { bottomOffset: 20 }}
      >
        {!scroll ? (
          <View style={[styles.wrapper, innerStyle]}>{children}</View>
        ) : (
          children
        )}
      </Wrapper>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
});
