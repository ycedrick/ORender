import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export interface KeyboardAwareViewProps {
  /** Extra bottom offset. Defaults to 0. */
  offset?: number;
  /** Additional styles for the container. */
  style?: ViewStyle;
  /** Style for the inner content container. */
  contentContainerStyle?: ViewStyle;
  children: React.ReactNode;
}

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  offset = 0,
  style,
  contentContainerStyle,
}) => {
  return (
    <KeyboardAwareScrollView
      bottomOffset={offset}
      style={[styles.container, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
