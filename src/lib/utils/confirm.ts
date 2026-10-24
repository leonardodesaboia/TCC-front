import { Alert, Platform } from 'react-native';

interface ConfirmActionOptions {
  title: string;
  message: string;
  confirmText: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Pede confirmação antes de uma ação. Na web o Alert do React Native não aparece, então usa window.confirm. */
export function confirmAction({ title, message, confirmText, destructive = false, onConfirm }: ConfirmActionOptions) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
