import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface CalendarDay {
  id: string;
  weekday: string;
  label: string;
  dayNumber: string;
  isToday?: boolean;
  hasAppointments?: boolean;
}

interface AppointmentsCalendarProps {
  days: CalendarDay[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
}

export function AppointmentsCalendar({ days, selectedDayId, onSelectDay }: AppointmentsCalendarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {days.map((day) => {
        const selected = day.id === selectedDayId;
        return (
          <Pressable key={day.id} onPress={() => onSelectDay(day.id)} style={[styles.card, selected && styles.cardSelected]}>
            <Text variant="labelLg" color={selected ? '#FFFFFF' : colors.neutral[500]}>{day.weekday}</Text>
            <Text variant="titleSm" color={selected ? '#FFFFFF' : colors.neutral[900]}>{day.dayNumber}</Text>
            {day.hasAppointments ? (
              <View style={[styles.dot, selected && styles.dotSelected]} />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[2] },
  card: {
    width: 56,
    alignItems: 'center',
    gap: spacing[1],
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[3],
  },
  cardSelected: { backgroundColor: colors.neutral[900] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary.default, marginTop: spacing[1] },
  dotSelected: { backgroundColor: '#FFFFFF' },
});
