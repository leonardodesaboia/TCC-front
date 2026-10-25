import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/ui';
import { queryKeys } from '@/lib/constants/query-keys';
import { useProfessional } from '@/lib/hooks/useProfessionals';
import { clientIntegration } from '@/lib/integrations/client';

type AvatarProps = React.ComponentProps<typeof Avatar>;

interface ProfessionalAvatarProps extends Omit<AvatarProps, 'uri'> {
  professionalId?: string | null;
}

/**
 * Avatar com a foto do profissional. Pedidos e conversas não trazem a foto, então ela
 * vem do perfil (em cache, compartilhado com as outras telas); sem foto, mostra a inicial.
 */
export function ProfessionalAvatar({ professionalId, ...props }: ProfessionalAvatarProps) {
  const professionalQuery = useProfessional(professionalId ?? '');
  return <Avatar uri={professionalQuery.data?.avatarUrl} {...props} />;
}

/** Mesma foto, partindo do pedido da conversa (a conversa só traz o id do usuário). */
export function OrderProfessionalAvatar({ orderId, ...props }: Omit<AvatarProps, 'uri'> & { orderId: string }) {
  // Mesma chave do detalhe do pedido, mas sem o polling dele: aqui só interessa o profissional.
  const orderQuery = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => clientIntegration.orders.getById(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
  return <ProfessionalAvatar professionalId={orderQuery.data?.professionalId} {...props} />;
}
