# Plano de implementação — Selecionar profissional no fluxo Sob demanda

## Contexto

Hoje, no app cliente, depois que o usuário escolhe uma área e categoria, ele cai direto na tela de **pedido Express** (`(client)/(orders)/express.tsx`). Não existe um caminho navegável de "buscar e escolher um profissional" antes de criar o pedido. A tela de detalhe do profissional (`(client)/(search)/professionals/[id].tsx`) só é acessível por deep link ou pelo botão "Ver perfil" dentro de um pedido já aceito — ou seja, ninguém chega lá pelo fluxo principal.

A API e os tipos já suportam listagem de profissionais por área/profissão (`professionalsApi.search`, `getByArea`, `getByProfession`), e o hook `useSearchProfessionals` existe mas não é usado em nenhuma tela.

## Objetivo

Permitir que, ao escolher uma categoria, o usuário tenha duas opções claras:

1. **Pedido rápido (Express)** — fluxo atual: descreve o problema e recebe propostas.
2. **Escolher um profissional (Sob demanda)** — vê uma lista de profissionais aptos àquela categoria, abre o perfil, escolhe um serviço e agenda.

Tudo a partir do menu Buscar.

## Estado atual

### Telas envolvidas

| Tela | Caminho | Estado |
|---|---|---|
| Busca por área/categoria | `src/app/(client)/(search)/index.tsx` | Existente. Ao tocar numa categoria, navega direto para `/express`. |
| Pedido Express | `src/app/(client)/(orders)/express.tsx` | Existente. Recebe `areaId`/`categoryId`/`areaName`/`categoryName`. |
| Perfil do profissional | `src/app/(client)/(search)/professionals/[id].tsx` | Existente. Lista serviços, "Contratar" abre o serviço. |
| Detalhe do serviço | `src/app/(client)/(search)/services/[id].tsx` | Existente. "Agendar serviço" abre o checkout. |
| Checkout sob demanda | `src/app/(client)/(orders)/checkout/[serviceId].tsx` | Existente. Cria pedido on-demand. |

### API/Hooks existentes

- `professionalsApi.search({ query, professionId, areaId, page, limit })` — busca paginada
- `professionalsApi.getByArea(areaId)` — todos os profissionais de uma área
- `professionalsApi.getByProfession(professionId)` — por profissão
- `useSearchProfessionals(params)` — hook React Query, ainda não consumido
- `useProfessional(id)` — perfil individual

## Mudanças propostas

### 1. Tela nova: lista de profissionais por categoria

**Caminho sugerido**: `src/app/(client)/(search)/professionals/index.tsx`

**Responsabilidades**
- Receber por query params: `areaId`, `categoryId`, opcionalmente `areaName` e `categoryName` para exibição.
- Buscar profissionais via `useSearchProfessionals({ areaId })` (ou `getByArea`).
- Filtrar client-side os profissionais que tenham a `categoryId` selecionada nas suas especialidades/ofertas, enquanto não houver endpoint por categoria no backend (ver "Itens em aberto").
- Exibir cards com avatar, nome, profissão, rating, badge, distância (se disponível), CTA "Ver perfil".
- Estados de loading, erro, vazio.
- Pull-to-refresh.

**Filtros e ordenação na tela**
- Ordenar por rating decrescente como padrão.
- Filtros opcionais (chips no topo): "Mais bem avaliados", "Menor preço", "Disponível agora".
- Campo de busca textual reaproveitando `SearchBar`.

### 2. Modificar a tela Buscar para apresentar os dois caminhos

**Arquivo**: `src/app/(client)/(search)/index.tsx`

**Mudança**: ao tocar em uma categoria, em vez de ir direto para `/express`, abrir uma tela intermediária (ou modal/bottom sheet) com duas opções:

- **Pedido rápido (Express)** — card destacado em laranja/warning, copy curto: "Receba propostas de profissionais próximos em minutos"
- **Escolher profissional** — card neutro, copy: "Veja avaliações, preços e escolha quem vai atender você"

Implementação preferida: nova tela `src/app/(client)/(search)/category/[categoryId].tsx` que recebe `areaId/categoryId/areaName/categoryName`, mostra cabeçalho da categoria e os dois CTAs.

Alternativa mais leve: bottom sheet inline na própria tela de busca (sem nova rota). Tradeoff: rota dedicada permite deep link e analytics; bottom sheet é mais rápida de fechar.

### 3. Pequenos ajustes no perfil do profissional

**Arquivo**: `src/app/(client)/(search)/professionals/[id].tsx`

- Quando aberto a partir do fluxo de categoria, destacar visualmente os serviços que pertencem àquela categoria (badge "Categoria selecionada" no card do serviço).
- O botão "Contratar" hoje navega para o primeiro serviço; manter, mas se houver `categoryId` no contexto, priorizar o primeiro serviço dessa categoria.

### 4. Atualizar a Home

**Arquivo**: `src/app/(client)/(home)/index.tsx`

- A seção "Categorias" hoje navega direto para `/(client)/(search)`. Manter, já que o redirecionamento intermediário virá da tela de busca.
- Considerar adicionar um card "Profissionais favoritos" no futuro (fora do escopo deste plano).

## Hooks/integrações novos ou alterados

### `useProfessionalsByCategory(categoryId, areaId, params)`
Novo hook que encapsula a estratégia atual de filtrar por área + cliente:

```ts
// src/lib/hooks/useProfessionals.ts
export function useProfessionalsByCategory(
  categoryId: string | undefined,
  areaId: string | undefined,
  params?: GetProfessionalsByCategoryParamsDto,
) {
  return useQuery({
    queryKey: ['professionals', 'by-category', categoryId, areaId, params],
    queryFn: async () => {
      const list = await clientIntegration.professionals.search({ areaId, ...params });
      if (!categoryId) return list;
      return list.filter((pro) =>
        pro.specialties?.some((s) => s.toLowerCase().includes(categoryId)) ||
        pro.services?.some((svc) => svc.categoryId === categoryId),
      );
    },
    enabled: !!areaId,
  });
}
```

> Observação: o filtro client-side é uma ponte. O ideal é o backend expor `GET /api/v1/categories/{id}/professionals`.

## Itens em aberto / dependências de backend

1. **Endpoint por categoria**: o backend hoje só lista profissionais por área ou profissão. Para um filtro preciso, abrir uma issue para adicionar `GET /categories/{categoryId}/professionals` ou aceitar `categoryId` em `/professionals/search`. Enquanto isso, filtrar client-side.
2. **Distância e disponibilidade no resumo do profissional**: `ProfessionalSummary` tem `availabilityLabel` mas não distância. Sem isso, ordenação "mais perto" não é viável no MVP.
3. **`ProfessionalSummary.services`** não existe hoje no DTO de listagem (só em `ProfessionalProfileDto`). O filtro por categoria precisará carregar `bulk getById` (ruim) ou usar `specialties`. Recomendo: usar `specialties` por enquanto e pedir ao backend para incluir `categoryIds` no summary.

## Critérios de aceitação

- A partir de uma categoria, o usuário consegue alternar entre Express e Sob demanda em **um único toque**.
- A lista de profissionais carrega no máximo 1 segundo após a navegação (assumindo rede normal).
- Ao tocar em um profissional, a navegação leva ao perfil já existente sem quebrar o fluxo de checkout.
- Loading, erro e empty states cobrem cada nova tela.
- Pull-to-refresh em todas as listas novas.
- Pedidos criados a partir desse fluxo são marcados como `on_demand` e seguem o ciclo já implementado (cliente vê detalhe → profissional aceita → chat).
- Typecheck passa em todos os arquivos novos.

## Ordem de execução sugerida

1. **Hook `useProfessionalsByCategory`** (15 min) — sem UI, isolado.
2. **Tela intermediária de categoria** (1h) — `category/[categoryId].tsx` com os dois CTAs.
3. **Atualizar `(search)/index.tsx`** (15 min) — apontar para a tela intermediária em vez de `/express`.
4. **Tela de lista de profissionais** (1.5h) — `professionals/index.tsx` com cards, filtros e pull-to-refresh.
5. **Ajustes no perfil do profissional** (30 min) — badge "Categoria selecionada" e priorização do primeiro serviço da categoria.
6. **Validação ponta-a-ponta**: criar pedido on-demand pelo novo fluxo e confirmar que aparece como tal no detalhe do cliente e na inbox do profissional.

Total estimado: **3h30 de implementação** + revisão.

## Fora do escopo deste plano

- Filtros avançados (faixa de preço, distância real, disponibilidade por data).
- Favoritos / profissional fixo.
- Comparação lado a lado.
- Mudanças no fluxo Express.
- Endpoint por categoria no backend (deve ser tratado em PR separada).
