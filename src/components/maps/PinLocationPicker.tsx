import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Crosshair, MapPin, Minus, Plus } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface PinLocationPickerProps {
  value: Coordinates;
  onChange: (value: Coordinates) => void;
  disabled?: boolean;
  /**
   * `false` enquanto a pessoa ainda não escolheu o ponto — o mapa abre em algum
   * lugar de referência, mas o marcador aparece apagado e a legenda pede a
   * confirmação. Sem isso, um mapa recém-aberto parece já ter um pin escolhido.
   */
  confirmed?: boolean;
}

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 17;
const MIN_ZOOM = 14;
const MAX_ZOOM = 19;

// A política de uso dos tiles do OSM exige um User-Agent que identifique o app.
// No Android o Image manda o padrão do okhttp e os tiles voltam bloqueados.
// Na web o navegador já manda User-Agent e Referer próprios.
const TILE_HEADERS =
  Platform.OS === 'web' ? undefined : { 'User-Agent': 'AllSet/1.0 (com.allset.mobile)' };

function lngToTileX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    2 ** zoom
  );
}

function tileXToLng(x: number, zoom: number): number {
  return (x / 2 ** zoom) * 360 - 180;
}

function tileYToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function PinLocationPicker({
  value,
  onChange,
  disabled = false,
  confirmed = true,
}: PinLocationPickerProps) {
  const centerRef = useRef(value);
  // O arraste roda na thread de UI (Reanimated): o dedo move os tiles sem passar pelo JS.
  // Só ao soltar o novo centro vai para o JS e os tiles são recalculados.
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    centerRef.current = value;
  }, [value]);

  // Zera o deslocamento só quando os tiles já foram recalculados para o novo centro;
  // zerar antes faz o mapa voltar para o ponto antigo e depois pular.
  useLayoutEffect(() => {
    dragX.value = 0;
    dragY.value = 0;
  }, [value.lat, value.lng, dragX, dragY]);

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
  }));

  const tiles = useMemo(() => {
    if (!layout.width || !layout.height) return [];

    const centerX = lngToTileX(value.lng, zoom);
    const centerY = latToTileY(value.lat, zoom);
    const centerPixelX = centerX * TILE_SIZE;
    const centerPixelY = centerY * TILE_SIZE;
    const leftPixel = centerPixelX - layout.width / 2;
    const topPixel = centerPixelY - layout.height / 2;
    const firstTileX = Math.floor(leftPixel / TILE_SIZE) - 1;
    const firstTileY = Math.floor(topPixel / TILE_SIZE) - 1;
    const cols = Math.ceil(layout.width / TILE_SIZE) + 4;
    const rows = Math.ceil(layout.height / TILE_SIZE) + 4;
    const maxTile = 2 ** zoom;

    return Array.from({ length: rows * cols }, (_, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = firstTileX + col;
      const y = firstTileY + row;
      const wrappedX = ((x % maxTile) + maxTile) % maxTile;

      return {
        key: `${zoom}-${x}-${y}`,
        uri: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        left: x * TILE_SIZE - leftPixel,
        top: y * TILE_SIZE - topPixel,
        visible: y >= 0 && y < maxTile,
      };
    });
  }, [layout.height, layout.width, value.lat, value.lng, zoom]);

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }

  function updatePinFromPoint(locationX: number, locationY: number) {
    if (disabled || !layout.width || !layout.height) return;

    const center = centerRef.current;
    const centerX = lngToTileX(center.lng, zoom);
    const centerY = latToTileY(center.lat, zoom);
    const deltaX = (locationX - layout.width / 2) / TILE_SIZE;
    const deltaY = (locationY - layout.height / 2) / TILE_SIZE;

    const next = {
      lat: clamp(tileYToLat(centerY + deltaY, zoom), -90, 90),
      lng: clamp(tileXToLng(centerX + deltaX, zoom), -180, 180),
    };

    centerRef.current = next;
    onChange(next);
  }

  function handleDragEnd(totalX: number, totalY: number) {
    if (disabled || !layout.width || !layout.height) return;

    const center = centerRef.current;
    const centerX = lngToTileX(center.lng, zoom);
    const centerY = latToTileY(center.lat, zoom);

    const next = {
      lat: clamp(tileYToLat(centerY - totalY / TILE_SIZE, zoom), -90, 90),
      lng: clamp(tileXToLng(centerX - totalX / TILE_SIZE, zoom), -180, 180),
    };

    centerRef.current = next;
    onChange(next);
  }

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(4)
    .onUpdate((event) => {
      dragX.value = event.translationX;
      dragY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(handleDragEnd)(event.translationX, event.translationY);
    });

  const tapGesture = Gesture.Tap()
    .enabled(!disabled)
    .onEnd((event, success) => {
      if (success) runOnJS(updatePinFromPoint)(event.x, event.y);
    });

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={Gesture.Exclusive(panGesture, tapGesture)}>
        <View onLayout={handleLayout} style={styles.map}>
          <Animated.View style={[styles.tileLayer, dragStyle]}>
            {tiles.map((tile) =>
              tile.visible ? (
                <Image
                  key={tile.key}
                  source={{ uri: tile.uri, headers: TILE_HEADERS }}
                  resizeMode="cover"
                  fadeDuration={0}
                  style={[styles.tile, { left: tile.left, top: tile.top }]}
                />
              ) : null,
            )}
          </Animated.View>
          <View pointerEvents="none" style={styles.pin}>
            <MapPin
              color={confirmed ? colors.error : colors.neutral[400]}
              fill={confirmed ? colors.error : 'transparent'}
              size={36}
            />
          </View>
          <View pointerEvents="none" style={styles.crosshair}>
            <Crosshair color={colors.neutral[700]} size={16} />
          </View>
          <View pointerEvents="none" style={styles.attribution}>
            <Text variant="labelSm" color={colors.neutral[700]}>
              © OpenStreetMap contributors
            </Text>
          </View>
        </View>
      </GestureDetector>

      <View style={styles.toolbar}>
        <View style={styles.coordinateBox}>
          <Text variant="labelLg" color={confirmed ? colors.success : colors.neutral[500]}>
            {confirmed ? 'Local marcado no mapa' : 'Toque no mapa para marcar o local'}
          </Text>
        </View>
        <View style={styles.zoomControls}>
          <Pressable
            hitSlop={8}
            onPress={() => setZoom((current) => clamp(current - 1, MIN_ZOOM, MAX_ZOOM))}
            accessibilityRole="button"
            accessibilityLabel="Diminuir zoom"
            style={styles.iconButton}
          >
            <Minus color={colors.neutral[700]} size={18} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => setZoom((current) => clamp(current + 1, MIN_ZOOM, MAX_ZOOM))}
            accessibilityRole="button"
            accessibilityLabel="Aumentar zoom"
            style={styles.iconButton}
          >
            <Plus color={colors.neutral[700]} size={18} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
    overflow: 'hidden',
  },
  map: {
    height: 260,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  tileLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  pin: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -18,
    marginTop: -36,
  },
  crosshair: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -8,
    marginTop: -8,
  },
  attribution: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopLeftRadius: radius.sm,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    padding: spacing[3],
  },
  coordinateBox: {
    flex: 1,
    gap: 2,
  },
  zoomControls: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
});
