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

export function AppointmentsCalendar({
  days,
  selectedDayId,
  onSelectDay,
}: AppointmentsCalendarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {days.map((day) => {
        const isSelected = day.id === selectedDayId;

        return (
          <Pressable
            key={day.id}
            onPress={() => onSelectDay(day.id)}
            style={[styles.card, isSelected && styles.cardSelected]}
          >
            <Text
              variant="labelLg"
              color={isSelected ? colors.neutral[50] : colors.neutral[500]}
            >
              {day.weekday}
            </Text>
            <Text
              variant="titleSm"
              color={isSelected ? colors.neutral[50] : colors.secondary.default}
            >
              {day.dayNumber}
            </Text>
            <Text
              variant="labelSm"
              color={isSelected ? '#FDE8D7' : day.isToday ? colors.primary.default : colors.neutral[500]}
            >
              {day.label}
            </Text>
            <View style={[styles.dot, day.hasAppointments && styles.dotVisible, isSelected && styles.dotSelected]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[3],
    paddingRight: spacing[4],
  },
  card: {
    width: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  cardSelected: {
    backgroundColor: colors.primary.default,
    borderColor: colors.primary.default,
  },
  dot: {
    width: 7,
    height: 7,
    marginTop: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.transparent,
  },
  dotVisible: {
    backgroundColor: colors.primary.default,
  },
  dotSelected: {
    backgroundColor: colors.neutral[50],
  },
});
