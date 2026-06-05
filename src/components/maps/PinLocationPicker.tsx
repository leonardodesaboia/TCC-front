import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';
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
}

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 17;
const MIN_ZOOM = 14;
const MAX_ZOOM = 19;

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

export function PinLocationPicker({ value, onChange, disabled = false }: PinLocationPickerProps) {
  const mapRef = useRef<View>(null);
  const centerRef = useRef(value);
  const dragStartCenterRef = useRef(value);
  const dragRef = useRef({ pageX: 0, pageY: 0, totalX: 0, totalY: 0, moved: false });
  const dragOffset = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    centerRef.current = value;
  }, [value]);

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

  function getCoordinatesFromDrag(totalX: number, totalY: number): Coordinates | null {
    if (disabled || !layout.width || !layout.height) return null;

    const center = dragStartCenterRef.current;
    const centerX = lngToTileX(center.lng, zoom);
    const centerY = latToTileY(center.lat, zoom);

    return {
      lat: clamp(tileYToLat(centerY - totalY / TILE_SIZE, zoom), -90, 90),
      lng: clamp(tileXToLng(centerX - totalX / TILE_SIZE, zoom), -180, 180),
    };
  }

  function handleMapTap(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent;
    mapRef.current?.measureInWindow((x, y) => {
      updatePinFromPoint(pageX - x, pageY - y);
    });
  }

  function handleResponderGrant(event: GestureResponderEvent) {
    const { pageX, pageY } = event.nativeEvent;
    dragStartCenterRef.current = centerRef.current;
    dragRef.current = { pageX, pageY, totalX: 0, totalY: 0, moved: false };
    dragOffset.setValue({ x: 0, y: 0 });
  }

  function handleResponderMove(event: GestureResponderEvent) {
    if (disabled) return;

    const { pageX, pageY } = event.nativeEvent;
    const deltaX = pageX - dragRef.current.pageX;
    const deltaY = pageY - dragRef.current.pageY;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      const totalX = dragRef.current.totalX + deltaX;
      const totalY = dragRef.current.totalY + deltaY;

      dragRef.current.moved = true;
      dragRef.current.pageX = pageX;
      dragRef.current.pageY = pageY;
      dragRef.current.totalX = totalX;
      dragRef.current.totalY = totalY;
      dragOffset.setValue({ x: totalX, y: totalY });
    }
  }

  function handleResponderRelease(event: GestureResponderEvent) {
    if (disabled) return;

    if (!dragRef.current.moved) {
      handleMapTap(event);
      return;
    }

    const next = getCoordinatesFromDrag(dragRef.current.totalX, dragRef.current.totalY);
    dragOffset.setValue({ x: 0, y: 0 });

    if (next) {
      centerRef.current = next;
      onChange(next);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View
        ref={mapRef}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={handleResponderGrant}
        onResponderMove={handleResponderMove}
        onResponderRelease={handleResponderRelease}
        onResponderTerminate={handleResponderRelease}
        style={styles.map}
      >
        <Animated.View
          style={[
            styles.tileLayer,
            {
              transform: dragOffset.getTranslateTransform(),
            },
          ]}
        >
          {tiles.map((tile) =>
            tile.visible ? (
              <Image
                key={tile.key}
                source={{ uri: tile.uri }}
                resizeMode="cover"
                style={[styles.tile, { left: tile.left, top: tile.top }]}
              />
            ) : null,
          )}
        </Animated.View>
        <View pointerEvents="none" style={styles.pin}>
          <MapPin color={colors.error} fill={colors.error} size={36} />
        </View>
        <View pointerEvents="none" style={styles.crosshair}>
          <Crosshair color={colors.neutral[700]} size={16} />
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.coordinateBox}>
          <Text variant="labelSm" color={colors.neutral[500]}>
            Pin selecionado
          </Text>
          <Text variant="labelLg" color={colors.neutral[700]}>
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </Text>
        </View>
        <View style={styles.zoomControls}>
          <Pressable
            hitSlop={8}
            onPress={() => setZoom((current) => clamp(current - 1, MIN_ZOOM, MAX_ZOOM))}
            style={styles.iconButton}
          >
            <Minus color={colors.neutral[700]} size={18} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => setZoom((current) => clamp(current + 1, MIN_ZOOM, MAX_ZOOM))}
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
