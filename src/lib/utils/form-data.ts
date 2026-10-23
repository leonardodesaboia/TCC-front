import { Platform } from 'react-native';

export interface PickedImage {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
}

/**
 * Anexa uma imagem escolhida no seletor ao FormData no formato certo para cada plataforma.
 * No celular o React Native aceita o objeto { uri, type, name }; na web é preciso um Blob,
 * senão o navegador envia o texto "[object Object]" e o backend não recebe o arquivo.
 */
export async function appendImage(formData: FormData, field: string, image: PickedImage, fallbackName: string) {
  const name = image.fileName ?? fallbackName;
  const type = image.mimeType ?? 'image/jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(image.uri);
    const blob = await response.blob();
    formData.append(field, blob, name);
    return;
  }

  formData.append(field, { uri: image.uri, type, name } as unknown as Blob);
}
