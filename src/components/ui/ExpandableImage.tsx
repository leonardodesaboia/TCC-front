import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type ImageResizeMode,
  type StyleProp,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface ExpandableImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  /** Estilo da área tocável (ex.: alignSelf: 'stretch' quando o pai centraliza os itens). */
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
}

/** Miniatura que abre a foto em tela cheia ao tocar (ex.: foto do pedido, comprovação). */
export function ExpandableImage({ uri, style, containerStyle, resizeMode = 'cover', accessibilityLabel = 'Ampliar foto' }: ExpandableImageProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={containerStyle} accessibilityRole="imagebutton" accessibilityLabel={accessibilityLabel}>
        <Image source={{ uri }} style={style} resizeMode={resizeMode} />
      </Pressable>

      <Modal visible={open} animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={styles.viewer}>
          <Image source={{ uri }} style={styles.fullImage} resizeMode="contain" />
          <Pressable
            onPress={() => setOpen(false)}
            style={[styles.closeBtn, { top: insets.top + 12 }]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Fechar foto"
          >
            <X color="#FFFFFF" size={24} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  viewer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
