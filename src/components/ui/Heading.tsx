import React from 'react';
import { Text, TextProps } from './Text';
import { FontSizes, LetterSpacings } from '@/theme/types';

export interface HeadingProps extends Omit<TextProps, 'variant' | 'weight' | 'letterSpacing'> {
  /** Heading level (1-4). Defaults to 1. */
  level?: 1 | 2 | 3 | 4;
}

const levelMap: Record<number, { variant: keyof FontSizes; weight: 'bold' | 'semibold'; letterSpacing: keyof LetterSpacings }> = {
  1: { variant: 'display', weight: 'bold', letterSpacing: 'tight' },
  2: { variant: 'xxl', weight: 'bold', letterSpacing: 'tight' },
  3: { variant: 'xl', weight: 'semibold', letterSpacing: 'normal' },
  4: { variant: 'lg', weight: 'semibold', letterSpacing: 'normal' },
};

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  children,
  style,
  ...rest
}) => {
  const { variant, weight, letterSpacing } = levelMap[level];

  return (
    <Text
      variant={variant}
      weight={weight}
      letterSpacing={letterSpacing}
      style={style}
      {...rest}
    >
      {children}
    </Text>
  );
};
