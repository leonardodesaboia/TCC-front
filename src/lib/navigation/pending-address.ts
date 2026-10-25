/**
 * Endereço recém-criado de dentro de um pedido. A tela do pedido lê isto ao voltar
 * a ter foco e já deixa o endereço novo selecionado.
 */
let pendingAddressId: string | null = null;

export function setPendingAddressSelection(id: string) {
  pendingAddressId = id;
}

export function consumePendingAddressSelection(): string | null {
  const id = pendingAddressId;
  pendingAddressId = null;
  return id;
}
