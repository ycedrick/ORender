import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text, TextProps } from './Text';
import { HStack } from './HStack';

export interface LabelProps extends Omit<TextProps, 'style'> {
  /** If true, shows a red '*' indicator. Defaults to false. */
  required?: boolean;
  /** If true, renders in theme.colors.error. Defaults to false. */
  error?: boolean;
  /** Style for the label container. */
  style?: StyleProp<ViewStyle>;
}

export const Label: React.FC<LabelProps> = ({
  children,
  required = false,
  error = false,
  style,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <HStack spacing="xxs" align="center" style={style}>
      <Text
        variant="sm"
        weight="medium"
        color={error ? theme.colors.error : theme.colors.text.secondary}
        {...rest}
      >
        {children}
      </Text>
      {required && (
        <Text variant="sm" color={theme.colors.error}>
          *
        </Text>
      )}
    </HStack>
  );
};
