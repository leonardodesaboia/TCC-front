# Design: Localização em Tempo Real do Profissional para o Fluxo Express

**Data:** 2026-05-04
**Status:** Aprovado

## Contexto

O fluxo Express atual está descrito em [`TCC-back/docs/express-radius-simplification.md`](../../../../TCC-back/docs/express-radius-simplification.md) (mergeado em 2026-05-01, V22). Esse documento **supera** os antigos `EXPRESS_MATCHING_SPEC.md` e `EXPRESS_MATCHING_IMPLEMENTATION_PLAN.md`, que descreviam expansão progressiva de raio (100m → 200m → 300m) — esse modelo **não existe mais**.

Estado atual do Express:

- Quando o cliente cria um pedido Express, o backend faz **uma única busca** por profissionais dentro de um raio fixo (`EXPRESS_SEARCH_RADIUS_METERS`, padrão 300m) e snapshota a fila inteira em `express_queue` com `distance_meters`.
- Janela em duas fases sob um único `pending`: 0–15 min para propostas; 15–45 min para o cliente escolher entre as recebidas; cancelamento automático em 45 min.
- A recência da localização do profissional só importa **no instante da criação do pedido**. Depois disso, o profissional já está na fila com snapshot — não há re-matching nem expansão. Isso significa: se a posição persistida no backend está velha quando um cliente cria um pedido naquele bairro, o profissional perde o pedido inteiro (sem segunda chance).
- A query atual (`ExpressQueueRepository.findNearbyProfessionals`) filtra por `geo_active = TRUE` mas **não filtra por recência** — porque o campo `geo_captured_at` não existe no domínio ainda.

Estado atual do frontend profissional:

- O endpoint `PATCH /api/v1/professionals/{id}/geo` aceita `geoActive`, `geoLat`, `geoLng`, mas não persiste timestamp.
- `(professional)/(profile)/edit.tsx` e `(profile)/index.tsx` têm lógica duplicada que captura a posição **uma única vez** ao ativar o toggle. Não há atualização contínua, sem tratamento de permissão revogada, sem indicação visual de localização desatualizada.

Esta feature:

1. Adiciona captura contínua no frontend (foreground-only, com debounce) enquanto o profissional está disponível para Express.
2. Persiste no backend `geo_captured_at`, `geo_accuracy_meters` e `geo_source`, criando o índice parcial necessário para uma futura adição de filtro de recência na matching query (fora deste escopo, mas habilitado por este trabalho).

## Escopo

- Frontend profissional: captura contínua, debounce, máquina de estados, UI por estado.
- Backend: extensão mínima para persistir `capturedAt`, `accuracyMeters`, `source` (sem endpoint dedicado de heartbeat).

**Fora de escopo**:

- Background location (foreground-only no MVP).
- Endpoint dedicado `/heartbeat` separado do update de perfil.
- Adicionar filtro `geo_captured_at >= now() - X` à matching query (`ExpressQueueRepository.findNearbyProfessionals`). Esta feature **prepara o terreno** (cria a coluna, popula via front, indexa) mas não modifica a query.
- UI do cliente vendo o profissional em tempo real num mapa.

## Decisões

| ID | Decisão | Motivo |
|---|---|---|
| D1 | Foreground-only | Evita revisão Apple/Google para "Always Allow"; janela de recência curta (5 min) cobre uso típico de profissional com app aberto. |
| D2 | Watch híbrido + debounce de envio | `watchPositionAsync({ timeInterval: 60_000, distanceInterval: 25 })` localmente; envia ao backend no máximo 1×/min OU se moveu >50m desde último envio. Reduz tráfego sem perder frescor. |
| D3 | Background = passivo; permissão revogada = ativo | App em background pausa o watch local mas mantém `geoActive=true` no servidor (a recência envelhece sozinha). Permissão revogada força `geoActive=false` imediato com banner explicativo. |
| D4 | Janela de recência client-side: 5 min | Como o matching ocorre uma única vez na criação do pedido (sem expansão), o profissional não pode estar com posição velha quando um cliente próximo abre um pedido — caso contrário perde o pedido inteiro. 5 min é um equilíbrio entre frescor e tráfego: dá tempo para o debounce respirar (1 envio/min) e ainda assim mantém o profissional sempre dentro de uma janela curta. Em `lastCapturedAt > 4 min`, front entra em `stale` e força captura. |
| D5 | Frontend + extensão mínima do backend (capturedAt, accuracyMeters, source) | Sem `capturedAt` persistido, não há base para o filtro de recência que a matching query precisará no futuro. Endpoint atual `PATCH /geo` aceita os campos novos sem precisar criar endpoint dedicado. |

---

## 1. Backend

### 1.1 Migration

**Arquivo:** `TCC-back/src/main/resources/db/migration/V23__add_professional_geo_metadata.sql`

```sql
ALTER TABLE professionals
  ADD COLUMN geo_captured_at      TIMESTAMP,
  ADD COLUMN geo_accuracy_meters  NUMERIC(7,2),
  ADD COLUMN geo_source           VARCHAR(20);

CREATE INDEX idx_professionals_geo_active_captured
  ON professionals (geo_active, geo_captured_at)
  WHERE geo_active = true;
```

`TIMESTAMP` (sem TZ) segue a convenção do schema atual (`created_at`, `updated_at`, `subscription_expires_at` em `V8__create_professionals.sql`).

Índice parcial cobre só profissionais ativos. A query de matching atual (`ExpressQueueRepository.findNearbyProfessionals`) ainda filtra apenas por `geo_active = TRUE`; quando ela passar a incluir `AND geo_captured_at >= now() - interval '5 minutes'` (trabalho futuro, fora deste escopo), o índice já estará pronto para servir a condição.

### 1.2 Domain

**Arquivo:** `professional/domain/Professional.java`

Adicionar três campos com `@Column` mapeando snake_case:

- `Instant geoCapturedAt` → `geo_captured_at`
- `BigDecimal geoAccuracyMeters` → `geo_accuracy_meters` (precision 7, scale 2)
- `String geoSource` → `geo_source` (length 20)

### 1.3 DTO de entrada

**Arquivo:** `professional/dto/UpdateGeoRequest.java`

Estender mantendo compatibilidade — os 3 campos novos são **opcionais** (a chamada antiga `{ geoActive, geoLat, geoLng }` continua válida):

```java
public record UpdateGeoRequest(
    @NotNull Boolean geoActive,
    @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal geoLat,
    @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal geoLng,
    @DecimalMin("0.0") BigDecimal accuracyMeters,
    Instant capturedAt,
    @Size(max = 20) String source
) {}
```

### 1.4 DTO de saída

**Arquivo:** `professional/dto/ProfessionalResponse.java`

Expor para o frontend saber se a posição persistida está fresca após reload:

- `Instant geoCapturedAt`
- `BigDecimal geoAccuracyMeters`

`geoSource` fica interno por enquanto.

### 1.5 Service

**Arquivo:** `professional/service/ProfessionalServiceImpl.java`, método `updateGeo`:

1. Quando `geoActive=true` e `capturedAt` veio na request: validar que está dentro de `[now - 1h, now + 30s]`. Se sim, persiste; se não (clock skew), substitui por `Instant.now()` e loga `warn`.
2. Quando `geoActive=true` e `capturedAt` não veio: usar `Instant.now()` (compatibilidade com cliente antigo).
3. Quando `geoActive=false`: definir `geoCapturedAt = null`, `geoAccuracyMeters = null`, `geoSource = null` para deixar explícito que a posição não vale mais.
4. Logar transições de `geoActive` em `info` (`professionalId`, novo valor).

### 1.6 Mapper

**Arquivo:** `professional/mapper/ProfessionalMapper.java` — incluir os campos novos no mapeamento entity ↔ response.

### 1.7 Testes backend

**Arquivo:** `professional/service/ProfessionalServiceImplTest.java` (estender):

- Ativar com `capturedAt` em `now() - 5s` (dentro da margem) → persiste tal qual.
- Ativar sem `capturedAt` → fallback `Instant.now()`.
- Ativar com `capturedAt` em `now() + 1min` (fora da margem futura de 30s) → substitui por `now()` e loga warn.
- Ativar com `capturedAt` em `now() - 2h` (fora da margem passada de 1h) → substitui por `now()` e loga warn.
- Desativar → `geoCapturedAt`, `geoAccuracyMeters`, `geoSource` ficam `null`.

---

## 2. Frontend

### 2.1 Arquitetura

```
(professional)/_layout.tsx
└─ <ExpressAvailabilityProvider>           ← Context, dono do estado e do watch
   ├─ <ExpressStatusBar/>                  ← banner global, só em estados problemáticos
   └─ Slot (telas)
      ├─ (profile)/index.tsx
      │  └─ <ExpressAvailabilityCard variant="default"/>
      ├─ (profile)/edit.tsx                ← toggle removido
      └─ (dashboard)/index.tsx
         └─ <ExpressAvailabilityCard variant="compact"/>
```

**Por que Provider no layout `(professional)`**: o watch precisa sobreviver à navegação entre abas. Se for hook em uma tela, o tracking morre quando o profissional sai dessa tela. Provider no layout mantém o tracking vivo enquanto o profissional estiver em qualquer rota da área dele.

### 2.2 Tipos

**Arquivo:** `src/lib/availability/types.ts`

```ts
export type ExpressAvailabilityStatus =
  | 'idle'                    // toggle off
  | 'requesting-permission'   // pediu permissão, aguardando
  | 'permission-denied'       // permissão negada
  | 'capturing'               // toggle on, primeira captura em andamento
  | 'active'                  // recebendo updates frescos
  | 'stale'                   // último envio > 4 min, tentando atualizar
  | 'unavailable';            // falhou em obter posição mesmo com permissão

export interface ExpressAvailabilityState {
  status: ExpressAvailabilityStatus;
  geoActive: boolean;
  lastCapturedAt: Date | null;
  lastAccuracyMeters: number | null;
}

export interface ExpressAvailabilityActions {
  toggle: (next: boolean) => Promise<void>;
  forceCapture: () => Promise<void>;
  openSettings: () => Promise<void>;
}
```

### 2.3 Provider

**Arquivo:** `src/lib/availability/ExpressAvailabilityProvider.tsx`

Responsabilidades:

1. **Inicialização**: ao montar, lê `profile.geoActive` da query existente. Se `true`, retoma o tracking automaticamente (cobre o caso de o profissional fechar e reabrir o app com o toggle ativo).
2. **Watch**: gerencia uma única `Location.LocationSubscription` ativa por vez.
3. **Debounce de envio** (`shouldFlushToBackend`):
   - moveu >50m desde último envio bem-sucedido → flush.
   - passou >60s desde último envio → flush.
   - caso contrário → ignora callback do watch.
4. **Recência client-side**: `setInterval(30s)` verifica `lastCapturedAt`. Se >4 min, dispara `forceCapture()` (chama `getCurrentPositionAsync` direto, não espera o watch). Se 2 falhas consecutivas → `'unavailable'`.
5. **AppState listener**:
   - `active → background`: chama `subscription.remove()`. **Não** chama backend. Mantém `geoActive=true` em state local.
   - `background → active`: se state local diz `geoActive=true`, recria subscription e força captura imediata. Antes, revalida permissão com `getForegroundPermissionsAsync()` — se sumiu, vai pra `'permission-denied'` e chama backend `geoActive=false`.
6. **Toggle ON**:
   1. `requestForegroundPermissionsAsync()`. Negada → `'permission-denied'`, retorna sem chamar backend.
   2. `getCurrentPositionAsync({ accuracy: Balanced })`. Falha → `'unavailable'`.
   3. `PATCH /geo { geoActive:true, geoLat, geoLng, accuracyMeters, capturedAt: now, source: 'device-gps' }`.
   4. Sucesso → cria subscription do watch, status `'active'`.
7. **Toggle OFF**:
   1. `subscription.remove()`.
   2. `PATCH /geo { geoActive: false }`. Falha de rede → 3 tentativas com backoff exponencial (1s, 2s, 4s). Esgotou → toast de erro, mantém state local consistente (não fica "fantasma ativo" — a próxima oportunidade de retry é a próxima ativação).
   3. Status `'idle'`, limpa `lastCapturedAt`.
8. **Cleanup no unmount**: chama `subscription.remove()` mas **não** chama backend (o usuário não pediu pra desativar; pode ser hot reload em dev).

### 2.4 Hook consumidor

**Arquivo:** `src/lib/availability/useExpressAvailability.ts`

Wrapper trivial sobre `useContext(ExpressAvailabilityContext)`. Lança erro se usado fora do Provider.

### 2.5 Componente principal

**Arquivo:** `src/components/availability/ExpressAvailabilityCard.tsx`

Variants:

- `default`: cabeçalho com título e switch + linha de status + (quando aplicável) ação contextual.
- `compact`: só switch + badge curto, sem mensagem nem ação.

Mapeamento status → UI (default):

| status | badge | mensagem | ação |
|---|---|---|---|
| `idle` | cinza "Desligado" | "Ative para receber pedidos próximos." | — |
| `requesting-permission` | spinner | "Solicitando permissão de localização…" | — |
| `permission-denied` | vermelho "Sem permissão" | "Permissão de localização negada. Habilite nas configurações para receber pedidos Express." | **Abrir configurações** (`Linking.openSettings()`) |
| `capturing` | spinner | "Localizando você…" | — |
| `active` | verde "Ativo" | "Recebendo pedidos próximos. Última atualização: há Ns." | — |
| `stale` | amarelo "Atualizando…" | "Sua posição está desatualizada. Tentando atualizar…" | **Atualizar agora** (chama `forceCapture()`) |
| `unavailable` | vermelho "Indisponível" | "Não foi possível obter sua localização. Verifique GPS e tente de novo." | **Tentar de novo** |

Acessibilidade: switch usa `accessibilityRole="switch"`, `accessibilityState={{ checked, busy }}`; status verbalizado em `accessibilityLabel` do badge.

### 2.6 Banner global

**Arquivo:** `src/components/availability/ExpressStatusBar.tsx`

Faixa fina no topo do layout `(professional)`. Aparece **apenas** quando `geoActive=true` E status ∈ {`permission-denied`, `stale`, `unavailable`}. Garante feedback mesmo em telas onde o card não está visível (lista de pedidos, chat, conversations). Toque na faixa leva para `(profile)`.

### 2.7 API client

**Arquivo:** `src/lib/api/professional-management.ts`

Estender `updateGeo` para aceitar `accuracyMeters`, `capturedAt`, `source`.

**Arquivo:** `src/types/professional-management.ts`

Estender `UpdateGeoRequest` (request) e `ProfessionalProfileRecord` (resposta) com os campos novos.

### 2.8 Limpeza das telas existentes

| Arquivo | Mudança |
|---|---|
| `src/app/(professional)/_layout.tsx` | Envolver `<Slot/>` com `<ExpressAvailabilityProvider>`. Renderizar `<ExpressStatusBar/>` antes do Slot. |
| `src/app/(professional)/(profile)/index.tsx` | Remover `useState`/`handleToggleExpress` locais e bloco de UI manual. Substituir por `<ExpressAvailabilityCard variant="default"/>`. |
| `src/app/(professional)/(profile)/edit.tsx` | Remover toggle de Express completamente. Tela vira só edição de bio/yearsOfExperience/etc. |
| `src/app/(professional)/(dashboard)/index.tsx` | Adicionar `<ExpressAvailabilityCard variant="compact"/>` em local de destaque. |

### 2.9 Testes frontend

**Arquivo:** `src/lib/availability/__tests__/ExpressAvailabilityProvider.test.tsx`

Mocks de `expo-location`, `react-native` `AppState`/`Linking` e do API client. Casos:

- toggle ON sem permissão → status `'permission-denied'`, **zero** chamadas a `updateGeo`.
- toggle ON com permissão → `'capturing'` → `'active'`, **uma** chamada com `geoActive=true` e os 6 campos.
- toggle OFF estando ativo → para watch, **uma** chamada com `geoActive=false`.
- 3 events do watch dentro de 60s e movimento <50m → **uma** chamada (debounce funciona).
- Movimento >50m antes dos 60s → flush imediato.
- `lastCapturedAt` simulado em `now - 5min` → entra em `'stale'` e dispara `forceCapture()`.
- `AppState` muda para `background` → para watch, mantém `geoActive=true` em state, **zero** chamadas.
- `AppState` volta para `active` com permissão revogada → vai para `'permission-denied'` e chama backend `geoActive=false`.
- Toggle OFF com 3 falhas de rede → toast de erro disparado, state local volta consistente.

---

## Critérios de aceite

1. Profissional ativa toggle pela primeira vez → permissão é solicitada → posição é capturada → `geoCapturedAt` aparece persistido no backend.
2. Profissional ativo se move ~100m caminhando → backend recebe ≥1 update dentro de 60s.
3. Profissional ativo fica parado por 3 minutos → backend recebe ≤3 updates (1 a cada 60s, sem flood).
4. Profissional minimiza o app por 30s e reabre → não há chamada de `updateGeo` no minimizar; ao reabrir, há captura imediata; `geoCapturedAt` no backend volta a ficar fresco.
5. Profissional minimiza o app por mais de 5 min → ao reabrir, status passa por `'stale'` antes de voltar a `'active'`.
6. Profissional revoga permissão nas configurações e reabre o app → status é `'permission-denied'`, banner global aparece, backend recebe `geoActive=false`.
7. Profissional desativa toggle → backend recebe `geoActive=false` e os campos `geo_*` ficam `null` no DB.
8. Tela de edição de perfil **não** contém mais toggle de Express.
9. Tela de dashboard mostra estado atual de disponibilidade Express sem precisar ir ao perfil.

## Não-objetivos / Trabalho futuro

- **Filtro de recência na matching query**: trabalho subsequente direto desta feature. Adicionar `AND p.geo_captured_at >= :recencyThreshold` em `ExpressQueueRepository.findNearbyProfessionals`. O índice parcial criado nesta migration já serve a esse filtro.
- **Background location**: pode entrar em uma fase futura se telemetria mostrar que profissionais perdem pedidos por minimizar o app. Requer permissão "Always" e revisão Apple/Google.
- **Endpoint `/heartbeat` dedicado**: separar quando o volume de updates passar a impactar o controller atual ou quando precisar de rate limiting diferente do resto do recurso.
- **Visualização do profissional no app cliente**: não faz parte deste escopo. O fluxo Express atual usa só `DistanceBand` para preservar privacidade do profissional.
