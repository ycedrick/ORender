import React from 'react';
import { View, ViewProps, FlexAlignType } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSpacing } from '@/theme/types';

export interface VStackProps extends ViewProps {
  /** Gap between children using theme spacing keys. Defaults to 'md'. */
  spacing?: keyof ThemeSpacing;
  /** alignItems shorthand. Defaults to 'stretch'. */
  align?: FlexAlignType;
  /** justifyContent shorthand. Defaults to 'flex-start'. */
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /** flex: 1 shorthand. Defaults to false. */
  fill?: boolean;
}

export const VStack: React.FC<VStackProps> = ({
  children,
  style,
  spacing = 'md',
  align = 'stretch',
  justify = 'flex-start',
  fill = false,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'column',
          gap: theme.spacing[spacing],
          alignItems: align,
          justifyContent: justify,
          flex: fill ? 1 : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
