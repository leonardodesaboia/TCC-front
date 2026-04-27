import { Pressable, StyleSheet, View } from 'react-native';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import { Avatar, Badge, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

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

export function UpcomingBookings({ bookings, onPressBooking }: UpcomingBookingsProps) {
  return (
    <View style={styles.list}>
      {bookings.map((b) => (
        <Pressable key={b.id} onPress={() => onPressBooking?.(b.id)} style={styles.card}>
          <View style={styles.top}>
            <Avatar name={b.professionalName} size="md" backgroundColor={b.accentColor} />
            <View style={styles.info}>
              <Text variant="titleSm">{b.title}</Text>
              <Text variant="bodySm" color={colors.neutral[500]}>{b.professionalName}</Text>
            </View>
            <Badge label={b.statusLabel} />
          </View>
          <View style={styles.meta}>
            <View style={styles.metaItem}><Calendar color={colors.neutral[400]} size={14} /><Text variant="labelLg" color={colors.neutral[600]}>{b.dateLabel}</Text></View>
            <View style={styles.metaItem}><Clock color={colors.neutral[400]} size={14} /><Text variant="labelLg" color={colors.neutral[600]}>{b.timeLabel}</Text></View>
            <View style={styles.metaItem}><MapPin color={colors.neutral[400]} size={14} /><Text variant="labelLg" color={colors.neutral[600]} numberOfLines={1}>{b.locationLabel}</Text></View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing[3] },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    gap: spacing[3],
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  info: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
});
