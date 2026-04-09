import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

export interface ContainerProps extends ViewProps {
  /** Maximum content width. Defaults to theme.layout.maxContentWidth. */
  maxWidth?: number;
  /** Center horizontally. Defaults to true. */
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  maxWidth,
  center = true,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          maxWidth: maxWidth || theme.layout.maxContentWidth,
          alignSelf: center ? 'center' : 'auto',
          width: '100%',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
