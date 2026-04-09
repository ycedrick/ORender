import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { Text, VStack, HStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { ReportBucket } from '../hooks/report-utils';

interface HoursChartProps {
  buckets: ReportBucket[];
  height?: number;
  title?: string;
  subtitle?: string;
}

export const HoursChart = ({ buckets, height = 180, title, subtitle }: HoursChartProps) => {
  const { theme } = useTheme();
  const [width, setWidth] = React.useState(0);

  const maxHours = Math.max(...buckets.map((bucket) => bucket.totalHours), 1);
  const chartInnerHeight = height - 28;
  const barGap = 10;
  const chartWidth = Math.max(width - 40, 1);
  const barWidth = buckets.length > 0
    ? Math.max((chartWidth - barGap * (buckets.length - 1)) / buckets.length, 8)
    : chartWidth;
  const maxLabel = `${maxHours.toFixed(1)}h`;
  const midLabel = `${(maxHours / 2).toFixed(1)}h`;
  const chartAverage = buckets.length
    ? `${(buckets.reduce((sum, bucket) => sum + bucket.totalHours, 0) / buckets.length).toFixed(1)}h avg`
    : 'No recorded hours';

  return (
    <VStack spacing="sm">
      <View
        style={[styles.chartCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width - 24)}
      >
        {(title || subtitle) ? (
          <VStack spacing="xxs" style={styles.chartHeader}>
            {title ? <Text variant="sm" weight="semibold">{title}</Text> : null}
            {subtitle ? (
              <Text variant="xs" color={theme.colors.text.secondary}>{subtitle}</Text>
            ) : null}
          </VStack>
        ) : null}

        <HStack spacing="sm" align="flex-end">
          <VStack spacing="md" style={styles.axisLabels}>
            <Text variant="xxs" color={theme.colors.text.tertiary}>{maxLabel}</Text>
            <Text variant="xxs" color={theme.colors.text.tertiary}>{midLabel}</Text>
            <Text variant="xxs" color={theme.colors.text.tertiary}>0h</Text>
          </VStack>

          <View style={styles.chartArea}>
            <Svg width="100%" height={height}>
              {[0, chartInnerHeight / 2, chartInnerHeight].map((offset, index) => (
                <Line
                  key={`grid-${index}`}
                  x1={0}
                  x2={chartWidth}
                  y1={offset}
                  y2={offset}
                  stroke={theme.colors.border.subtle}
                  strokeWidth={1}
                />
              ))}

              {buckets.map((bucket, index) => {
                const scaledHeight = (bucket.totalHours / maxHours) * chartInnerHeight;
                const barHeight = Math.max(scaledHeight, bucket.totalHours > 0 ? 10 : 4);
                const x = index * (barWidth + barGap);
                const y = chartInnerHeight - barHeight;
                const isLatest = index === buckets.length - 1;

                return (
                  <Rect
                    key={bucket.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={barWidth / 2.5}
                    fill={bucket.totalHours > 0
                      ? (isLatest ? theme.colors.action.primary : theme.colors.text.secondary)
                      : theme.colors.border.subtle}
                    opacity={bucket.totalHours > 0 ? (isLatest ? 1 : 0.85) : 1}
                  />
                );
              })}
            </Svg>
          </View>
        </HStack>

        <HStack justify="space-between" style={styles.labelsRow}>
          <View style={styles.chartMetaCell}>
            <Text variant="xxs" weight="semibold" color={theme.colors.text.tertiary}>
              RANGE
            </Text>
            <Text variant="xs" color={theme.colors.text.secondary}>
              {chartAverage}
            </Text>
          </View>
          <View style={styles.labelsGroup}>
            {buckets.map((bucket) => (
              <View key={bucket.key} style={styles.labelCell}>
                <Text variant="xxs" color={theme.colors.text.tertiary} align="center">
                  {bucket.shortLabel}
                </Text>
              </View>
            ))}
          </View>
        </HStack>
      </View>
    </VStack>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 12,
  },
  chartHeader: {
    marginBottom: 12,
  },
  axisLabels: {
    width: 32,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  chartArea: {
    flex: 1,
  },
  labelsRow: {
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  chartMetaCell: {
    width: 64,
    gap: 2,
  },
  labelsGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  labelCell: {
    flex: 1,
  },
});
