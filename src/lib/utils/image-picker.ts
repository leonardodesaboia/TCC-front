import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { toast } from '@/lib/utils/toast';

/** Maior lado da imagem enviada. Fotos de câmera em resolução cheia passam do limite de 5 MB da API. */
const MAX_IMAGE_SIDE = 1600;
const JPEG_QUALITY = 0.7;

export interface PickImageOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
}

type ImageSource = 'camera' | 'library';

function askImageSource(): Promise<ImageSource | null> {
  return new Promise((resolve) => {
    Alert.alert(
      'Adicionar foto',
      'De onde você quer enviar a foto?',
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
        { text: 'Galeria', onPress: () => resolve('library') },
        { text: 'Câmera', onPress: () => resolve('camera') },
      ],
      { cancelable: true, onDismiss: () => resolve(null) },
    );
  });
}

async function ensurePermission(source: ImageSource): Promise<boolean> {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permission.granted) return true;

  toast.error(
    'Permissão necessária',
    source === 'camera'
      ? 'Libere o acesso à câmera nas configurações do celular.'
      : 'Libere o acesso à galeria nas configurações do celular.',
  );
  return false;
}

async function shrinkImage(asset: ImagePicker.ImagePickerAsset): Promise<ImagePicker.ImagePickerAsset> {
  const longestSide = Math.max(asset.width ?? 0, asset.height ?? 0);
  if (!longestSide || longestSide <= MAX_IMAGE_SIDE) return asset;

  const context = ImageManipulator.manipulate(asset.uri);
  context.resize(asset.width >= asset.height ? { width: MAX_IMAGE_SIDE } : { height: MAX_IMAGE_SIDE });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });

  const baseName = (asset.fileName ?? 'foto').replace(/\.[^.]+$/, '');
  return {
    ...asset,
    uri: result.uri,
    width: result.width,
    height: result.height,
    mimeType: 'image/jpeg',
    fileName: `${baseName}.jpg`,
    fileSize: undefined,
  };
}

/**
 * Escolhe uma imagem da câmera ou da galeria (na web, só galeria) e reduz para no máximo
 * MAX_IMAGE_SIDE no lado maior. Devolve null se a pessoa cancelar ou negar a permissão.
 */
export async function pickImage(options: PickImageOptions = {}): Promise<ImagePicker.ImagePickerAsset | null> {
  const source = Platform.OS === 'web' ? 'library' : await askImageSource();
  if (!source) return null;
  if (Platform.OS !== 'web' && !(await ensurePermission(source))) return null;

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? false,
    aspect: options.aspect,
    quality: 0.8,
  };

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync(pickerOptions)
    : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets?.[0]) return null;

  // Na web o arquivo original (asset.file) é o que vai no upload; só reduz no celular.
  if (Platform.OS === 'web') return result.assets[0];

  try {
    return await shrinkImage(result.assets[0]);
  } catch {
    return result.assets[0];
  }
}
