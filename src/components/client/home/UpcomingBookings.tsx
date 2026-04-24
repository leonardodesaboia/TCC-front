import { Pressable, StyleSheet, View } from 'react-native';
import { CalendarDays, Clock3, MapPin, ArrowRight } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, radius, shadows, spacing } from '@/theme';

export interface UpcomingBooking {
  id: string;
  title: string;
  professionalName: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  statusLabel: string;
  accentColor?: string;
}

interface UpcomingBookingsProps {
  bookings: UpcomingBooking[];
  onPressBooking?: (bookingId: string) => void;
}

export function UpcomingBookings({
  bookings,
  onPressBooking,
}: UpcomingBookingsProps) {
  return (
    <View style={styles.list}>
      {bookings.map((booking) => (
        <Pressable
          key={booking.id}
          onPress={() => onPressBooking?.(booking.id)}
          style={styles.card}
        >
          <View style={[styles.accent, { backgroundColor: booking.accentColor ?? colors.primary.default }]} />
          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.topText}>
                <Text variant="titleSm">{booking.title}</Text>
                <Text color={colors.neutral[500]}>
                  com {booking.professionalName}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text variant="labelLg" color={colors.primary.default}>
                  {booking.statusLabel}
                </Text>
              </View>
            </View>

            <View style={styles.metaList}>
              <View style={styles.metaRow}>
                <CalendarDays color={colors.neutral[500]} size={16} />
                <Text color={colors.neutral[500]}>{booking.dateLabel}</Text>
              </View>
              <View style={styles.metaRow}>
                <Clock3 color={colors.neutral[500]} size={16} />
                <Text color={colors.neutral[500]}>{booking.timeLabel}</Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin color={colors.neutral[500]} size={16} />
                <Text color={colors.neutral[500]} numberOfLines={1}>
                  {booking.locationLabel}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text variant="labelLg" color={colors.secondary.default}>
                Ver detalhes
              </Text>
              <ArrowRight color={colors.primary.default} size={16} />
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
  },
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[50],
    ...shadows.sm,
  },
  accent: {
    width: 6,
  },
  content: {
    flex: 1,
    gap: spacing[3],
    padding: spacing[4],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  topText: {
    flex: 1,
    gap: spacing[1],
  },
  badge: {
    borderRadius: radius.full,
    backgroundColor: '#FFF1E5',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  metaList: {
    gap: spacing[2],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
