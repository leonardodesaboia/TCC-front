import { NewAddressScreen } from '@/components/profile/NewAddressScreen';
import { setPendingAddressSelection } from '@/lib/navigation/pending-address';

/** Novo endereço aberto de dentro do pedido: ao salvar, volta com ele já selecionado. */
export default function OrderNewAddressRoute() {
  return <NewAddressScreen onCreated={(address) => setPendingAddressSelection(address.id)} />;
}
