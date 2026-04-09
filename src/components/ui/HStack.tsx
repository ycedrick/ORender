import React from 'react';
import { View, ViewProps, FlexAlignType } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSpacing } from '@/theme/types';

export interface HStackProps extends ViewProps {
  /** Gap between children using theme spacing keys. Defaults to 'md'. */
  spacing?: keyof ThemeSpacing;
  /** alignItems shorthand. Defaults to 'center'. */
  align?: FlexAlignType;
  /** justifyContent shorthand. Defaults to 'flex-start'. */
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /** flexWrap: 'wrap' shorthand. Defaults to false. */
  wrap?: boolean;
  /** flex: 1 shorthand. Defaults to false. */
  fill?: boolean;
}

export const HStack: React.FC<HStackProps> = ({
  children,
  style,
  spacing = 'md',
  align = 'center',
  justify = 'flex-start',
  wrap = false,
  fill = false,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: theme.spacing[spacing],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
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
