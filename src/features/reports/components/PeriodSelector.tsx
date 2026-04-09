import React from 'react';
import { HStack, Chip } from '@/components/ui';
import { ReportPeriod } from '../hooks/report-utils';

interface PeriodSelectorProps {
  selectedPeriod: ReportPeriod;
  onSelectPeriod: (period: ReportPeriod) => void;
}

export const PeriodSelector = ({ selectedPeriod, onSelectPeriod }: PeriodSelectorProps) => {
  return (
    <HStack spacing="xs" wrap>
      <Chip label="Daily" selected={selectedPeriod === 'daily'} onPress={() => onSelectPeriod('daily')} />
      <Chip label="Weekly" selected={selectedPeriod === 'weekly'} onPress={() => onSelectPeriod('weekly')} />
      <Chip label="Monthly" selected={selectedPeriod === 'monthly'} onPress={() => onSelectPeriod('monthly')} />
    </HStack>
  );
};
