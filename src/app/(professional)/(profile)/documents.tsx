import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CheckCircle2, Clock, FileText, XCircle } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { Text } from '@/components/ui';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { useProfessionalDocuments, useUploadProfessionalDocument } from '@/lib/hooks/useProfessionalManagement';
import { formatDateFull } from '@/lib/utils/formatters';
import { appendImage } from '@/lib/utils/form-data';
import { toast } from '@/lib/utils/toast';
import type { DocType, DocumentSide, ProfessionalDocument } from '@/types/professional-management';
import { colors, radius, spacing } from '@/theme';

type IdDocType = Extract<DocType, 'rg' | 'cnh'>;

const STATUS_INFO = {
  pending: {
    Icon: Clock,
    color: colors.warning,
    title: 'Conta em análise',
    text: 'Seus documentos estão sendo verificados. Você só recebe pedidos Express depois da aprovação.',
  },
  approved: {
    Icon: CheckCircle2,
    color: colors.success,
    title: 'Conta ativa',
    text: 'Sua conta está liberada. Você já pode receber pedidos.',
  },
  rejected: {
    Icon: XCircle,
    color: colors.error,
    title: 'Documentos recusados',
    text: 'Envie novas fotos do documento para uma nova análise.',
  },
} as const;

function latestFor(documents: ProfessionalDocument[], docType: IdDocType, side: DocumentSide) {
  return documents
    .filter((doc) => doc.docType === docType && doc.docSide === side)
    .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))[0];
}

export default function ProfessionalDocumentsScreen() {
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;
  const documentsQuery = useProfessionalDocuments(profile?.id ?? '');
  const upload = useUploadProfessionalDocument(profile?.id ?? '');
  const documents = documentsQuery.data ?? [];

  const initialType: IdDocType = documents.some((doc) => doc.docType === 'cnh') ? 'cnh' : 'rg';
  const [docType, setDocType] = useState<IdDocType | null>(null);
  const selectedType = docType ?? initialType;

  if (profileQuery.isLoading || documentsQuery.isLoading) {
    return <LoadingScreen message="Carregando documentos..." />;
  }
  if (profileQuery.isError || !profile || documentsQuery.isError) {
    return <ErrorState message="Não foi possível carregar seus documentos." onRetry={() => void documentsQuery.refetch()} />;
  }

  const status = (profile.verificationStatus ?? 'pending') as keyof typeof STATUS_INFO;
  const info = STATUS_INFO[status] ?? STATUS_INFO.pending;
  const StatusIcon = info.Icon;

  async function pickAndUpload(side: DocumentSide) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast.error('Permissão necessária', 'Libere acesso à galeria para enviar o documento.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const formData = new FormData();
    await appendImage(formData, 'file', asset, `${selectedType}-${side}.jpg`);
    upload.mutate({ docType: selectedType, docSide: side, formData });
  }

  return (
    <Screen edges={['top']} scroll={false} style={styles.screen}>
      <Header title="Documentos" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { borderColor: info.color }]}>
          <StatusIcon color={info.color} size={22} />
          <View style={styles.statusText}>
            <Text variant="titleSm" color={info.color}>{info.title}</Text>
            <Text variant="bodySm" color={colors.neutral[700]}>{info.text}</Text>
            {status === 'rejected' && profile.rejectionReason ? (
              <Text variant="labelLg" color={colors.neutral[700]}>Motivo: {profile.rejectionReason}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleSm">Documento de identificação</Text>
          <View style={styles.chipsRow}>
            {(['rg', 'cnh'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setDocType(type)}
                style={[styles.chip, selectedType === type && styles.chipActive]}
              >
                <Text variant="labelLg" color={selectedType === type ? colors.neutral[50] : colors.neutral[700]}>
                  {type.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {(['front', 'back'] as const).map((side) => {
          const doc = latestFor(documents, selectedType, side);
          // O backend só aceita trocar um documento já enviado quando a verificação foi recusada.
          const canSend = !doc || status === 'rejected';
          return (
            <Pressable
              key={side}
              onPress={() => { void pickAndUpload(side); }}
              disabled={upload.isPending || !canSend}
              style={({ pressed }) => [styles.docCard, pressed && canSend && styles.pressed]}
            >
              <FileText color={colors.neutral[500]} size={22} />
              <View style={styles.docText}>
                <Text variant="titleSm">{side === 'front' ? 'Frente do documento' : 'Verso do documento'}</Text>
                <Text variant="labelLg" color={doc ? colors.success : colors.error}>
                  {doc
                    ? `Enviado${doc.createdAt ? ` em ${formatDateFull(new Date(doc.createdAt))}` : ''}`
                    : 'Ainda não enviado'}
                </Text>
              </View>
              {canSend ? (
                <Text variant="labelLg" color={colors.primary.default}>
                  {upload.isPending ? 'Enviando...' : doc ? 'Enviar de novo' : 'Enviar'}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: 0 },
  content: { gap: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[6] },
  statusCard: {
    flexDirection: 'row',
    gap: spacing[3],
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
  },
  statusText: { flex: 1, gap: spacing[1] },
  section: { gap: spacing[2] },
  chipsRow: { flexDirection: 'row', gap: spacing[2] },
  chip: {
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: { backgroundColor: colors.primary.default },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  docText: { flex: 1, gap: spacing[1] },
  pressed: { opacity: 0.8 },
});
