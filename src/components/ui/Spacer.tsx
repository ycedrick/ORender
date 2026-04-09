import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemeSpacing } from '@/theme/types';

export interface SpacerProps {
  /** Size based on theme spacing keys. Defaults to 'md'. */
  size?: keyof ThemeSpacing;
  /** Render horizontally instead of vertically. Defaults to false. */
  horizontal?: boolean;
  /** flex: 1 shorthand — flexible spacer to push items apart. Defaults to false. */
  flex?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  horizontal = false,
  flex = false 
}) => {
  const { theme } = useTheme();
  
  const spacingValue = theme.spacing[size]; 

  const style: ViewStyle = {
    flex: flex ? 1 : undefined,
    width: horizontal && !flex ? spacingValue : (flex && horizontal ? undefined : 0), 
    height: !horizontal && !flex ? spacingValue : (flex && !horizontal ? undefined : 0),
  };

  return <View style={style} />;
};
