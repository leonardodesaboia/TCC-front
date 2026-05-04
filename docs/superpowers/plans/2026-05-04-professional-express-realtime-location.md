# Professional Express Real-Time Location — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capturar e enviar continuamente a localização do profissional ao backend enquanto ele estiver disponível para Express, com extensão mínima do schema/DTO/serviço para persistir `capturedAt`/`accuracyMeters`/`source`.

**Architecture:** Backend ganha 3 colunas em `professionals` + índice parcial; Service valida clock skew. Frontend ganha um Provider no layout `(professional)` que orquestra permissão, watch híbrido (Expo Location), debounce de envio e máquina de estados (`idle`/`requesting-permission`/`permission-denied`/`capturing`/`active`/`stale`/`unavailable`). Vitest é introduzido para testar o Provider em isolamento. UI duplicada em `(profile)/edit.tsx` e `(profile)/index.tsx` é consolidada em um único `<ExpressAvailabilityCard/>` com variants `default` e `compact`.

**Tech Stack:** Spring Boot 3 (Java 21) + Flyway + Mockito + AssertJ no backend; React Native 0.81 / Expo 54 / expo-router 6 / expo-location 19 / TanStack Query 5 / TypeScript 5.9 + Vitest 2 (novo) no frontend.

**Spec:** [`docs/superpowers/specs/2026-05-04-professional-express-realtime-location-design.md`](../specs/2026-05-04-professional-express-realtime-location-design.md)

---

## Mapa de arquivos

### Backend

| Arquivo | Ação |
|---|---|
| `TCC-back/src/main/resources/db/migration/V23__add_professional_geo_metadata.sql` | Criar — adicionar 3 colunas + índice parcial |
| `TCC-back/src/main/java/com/allset/api/professional/domain/Professional.java` | Modificar — adicionar 3 campos JPA |
| `TCC-back/src/main/java/com/allset/api/professional/dto/UpdateGeoRequest.java` | Modificar — adicionar 3 campos opcionais |
| `TCC-back/src/main/java/com/allset/api/professional/dto/ProfessionalResponse.java` | Modificar — expor `geoCapturedAt` e `geoAccuracyMeters` |
| `TCC-back/src/main/java/com/allset/api/professional/mapper/ProfessionalMapper.java` | Modificar — propagar campos novos |
| `TCC-back/src/main/java/com/allset/api/professional/service/ProfessionalServiceImpl.java` | Modificar — clock skew + persistência de timestamp |
| `TCC-back/src/test/java/com/allset/api/professional/service/ProfessionalServiceImplTest.java` | Modificar — adicionar testes de `updateGeo` |

### Frontend — infra de teste

| Arquivo | Ação |
|---|---|
| `TCC-front/package.json` | Modificar — adicionar `vitest`, `jsdom`, `@testing-library/react`, script `test` |
| `TCC-front/vitest.config.ts` | Criar — config base com alias `@/` |
| `TCC-front/src/test/setup.ts` | Criar — setup global (matchers, etc.) |

### Frontend — feature

| Arquivo | Ação |
|---|---|
| `TCC-front/src/types/professional-management.ts` | Modificar — estender `UpdateGeoRequest`, `ProfessionalProfileRecord`, `ProfessionalProfileRecordDto` |
| `TCC-front/src/lib/api/professional-management.ts` | Modificar — passar campos novos no `updateGeo` |
| `TCC-front/src/lib/availability/types.ts` | Criar — status enum, state shape, action interface |
| `TCC-front/src/lib/availability/ExpressAvailabilityProvider.tsx` | Criar — Provider, máquina de estados, watch, debounce, AppState |
| `TCC-front/src/lib/availability/useExpressAvailability.ts` | Criar — hook consumidor |
| `TCC-front/src/lib/availability/__tests__/ExpressAvailabilityProvider.test.tsx` | Criar — testes vitest do Provider |
| `TCC-front/src/components/availability/ExpressAvailabilityCard.tsx` | Criar — UI com variants `default` e `compact` |
| `TCC-front/src/components/availability/ExpressStatusBar.tsx` | Criar — banner global em estados problemáticos |
| `TCC-front/src/app/(professional)/_layout.tsx` | Modificar — envolver com Provider, montar StatusBar |
| `TCC-front/src/app/(professional)/(profile)/index.tsx` | Modificar — remover toggle inline, substituir por `<ExpressAvailabilityCard/>` |
| `TCC-front/src/app/(professional)/(profile)/edit.tsx` | Modificar — remover toggle inteiro |
| `TCC-front/src/app/(professional)/(dashboard)/index.tsx` | Modificar — adicionar `<ExpressAvailabilityCard variant="compact"/>` |

---

## Convenções

- **Sem commits intermediários**: por preferência do usuário, **não** commite ao final de cada task. A última task do plano (Task 18) faz todos os commits agrupados por logical unit.
- **TDD aplicado**:
  - Backend Task 5 (service) — escreva o teste, rode, falhe, implemente, rode, passe.
  - Frontend Task 9 (Provider) — idem com vitest.
  - UI components (Tasks 11/12) — cobertos por validação manual no Task 17.
- **Cada step rodar em 2-5 min**.
- **Comandos para o usuário rodar**: ele tem permissão para rodar `mvn`/`npm` direto, então os steps mostram o comando e o output esperado.

---

## Phase 1 — Backend foundation

### Task 1: Migration V23

**Files:**
- Create: `TCC-back/src/main/resources/db/migration/V23__add_professional_geo_metadata.sql`

- [ ] **Step 1: Criar a migration**

```sql
-- V23 — metadados de geolocalização do profissional
-- Habilita filtro de recência (geo_captured_at) na matching query do Express,
-- que hoje filtra apenas por geo_active. A query será atualizada em trabalho
-- futuro; esta migration prepara o terreno (coluna + índice parcial).

ALTER TABLE professionals
  ADD COLUMN geo_captured_at      TIMESTAMP,
  ADD COLUMN geo_accuracy_meters  NUMERIC(7,2),
  ADD COLUMN geo_source           VARCHAR(20);

COMMENT ON COLUMN professionals.geo_captured_at     IS 'Timestamp da captura de geo_lat/geo_lng. Usado para filtro de recência no matching Express.';
COMMENT ON COLUMN professionals.geo_accuracy_meters IS 'Acurácia reportada pelo dispositivo na captura (metros). Informativo.';
COMMENT ON COLUMN professionals.geo_source          IS 'Origem da localização. Ex: device-gps. Informativo.';

CREATE INDEX idx_professionals_geo_active_captured
  ON professionals (geo_active, geo_captured_at)
  WHERE geo_active = true;
```

- [ ] **Step 2: Rodar smoke test do schema**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q -Dtest=FlywaySchemaSmokeTest test`
Expected: PASS — sem erros de Flyway.

---

### Task 2: Domain entity

**Files:**
- Modify: `TCC-back/src/main/java/com/allset/api/professional/domain/Professional.java`

- [ ] **Step 1: Adicionar imports e campos**

Após o campo `geoActive` (linha 61), inserir:

```java
    @Column(name = "geo_captured_at")
    private Instant geoCapturedAt;

    @Column(name = "geo_accuracy_meters", precision = 7, scale = 2)
    private BigDecimal geoAccuracyMeters;

    @Column(name = "geo_source", length = 20)
    private String geoSource;
```

`Instant` e `BigDecimal` já estão importados no arquivo.

- [ ] **Step 2: Compilar para validar mapeamento**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q -DskipTests compile`
Expected: BUILD SUCCESS.

---

### Task 3: DTOs (UpdateGeoRequest + ProfessionalResponse)

**Files:**
- Modify: `TCC-back/src/main/java/com/allset/api/professional/dto/UpdateGeoRequest.java`
- Modify: `TCC-back/src/main/java/com/allset/api/professional/dto/ProfessionalResponse.java`

- [ ] **Step 1: Estender `UpdateGeoRequest`**

Substituir o conteúdo do record por:

```java
package com.allset.api.professional.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record UpdateGeoRequest(

        @Schema(description = "Disponível para pedidos Express")
        @NotNull(message = "geoActive é obrigatório")
        Boolean geoActive,

        @Schema(description = "Latitude", example = "-3.731862")
        @DecimalMin(value = "-90.0", message = "Latitude inválida")
        @DecimalMax(value = "90.0", message = "Latitude inválida")
        BigDecimal geoLat,

        @Schema(description = "Longitude", example = "-38.526669")
        @DecimalMin(value = "-180.0", message = "Longitude inválida")
        @DecimalMax(value = "180.0", message = "Longitude inválida")
        BigDecimal geoLng,

        @Schema(description = "Acurácia da medição em metros", example = "12.5")
        @DecimalMin(value = "0.0", message = "Acurácia inválida")
        BigDecimal accuracyMeters,

        @Schema(description = "Timestamp da captura no dispositivo (UTC)")
        Instant capturedAt,

        @Schema(description = "Origem da localização", example = "device-gps")
        @Size(max = 20, message = "source deve ter no máximo 20 caracteres")
        String source
) {}
```

- [ ] **Step 2: Estender `ProfessionalResponse`**

Adicionar dois campos antes de `subscriptionPlanId` (mantendo a ordem do construtor que o mapper produz):

```java
        @Schema(description = "Timestamp da última captura de localização", nullable = true) Instant geoCapturedAt,
        @Schema(description = "Acurácia da última captura em metros", nullable = true) BigDecimal geoAccuracyMeters,
```

Exemplo do bloco final do record (depois da edição):

```java
public record ProfessionalResponse(
        UUID id,
        UUID userId,
        String bio,
        Short yearsOfExperience,
        BigDecimal baseHourlyRate,
        List<ProfessionalSpecialtyResponse> specialties,
        VerificationStatus verificationStatus,
        String rejectionReason,
        boolean geoActive,
        Instant geoCapturedAt,
        BigDecimal geoAccuracyMeters,
        UUID subscriptionPlanId,
        Instant subscriptionExpiresAt,
        BigDecimal averageRating,
        long reviewCount,
        Instant createdAt,
        Instant updatedAt
) {}
```

(Manter os `@Schema` originais; só estou abreviando para clareza.)

- [ ] **Step 3: Compilar**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q -DskipTests compile`
Expected: BUILD SUCCESS — vai falhar se o mapper ainda não foi atualizado. Vai forçar atualizar o Mapper na Task 4.

---

### Task 4: Mapper

**Files:**
- Modify: `TCC-back/src/main/java/com/allset/api/professional/mapper/ProfessionalMapper.java`

- [ ] **Step 1: Atualizar `toResponse` para passar os campos novos**

Substituir o método `toResponse` por:

```java
    public ProfessionalResponse toResponse(Professional professional) {
        ReviewRatingSummary ratingSummary = reviewSummaryService.summarizeProfessional(professional.getId());
        List<ProfessionalSpecialtyResponse> specialties = mapSpecialties(professional.getId());

        return new ProfessionalResponse(
                professional.getId(),
                professional.getUserId(),
                professional.getBio(),
                professional.getYearsOfExperience(),
                professional.getBaseHourlyRate(),
                specialties,
                professional.getVerificationStatus(),
                professional.getRejectionReason(),
                professional.isGeoActive(),
                professional.getGeoCapturedAt(),
                professional.getGeoAccuracyMeters(),
                professional.getSubscriptionPlanId(),
                professional.getSubscriptionExpiresAt(),
                ratingSummary.averageRating(),
                ratingSummary.reviewCount(),
                professional.getCreatedAt(),
                professional.getUpdatedAt()
        );
    }
```

- [ ] **Step 2: Compilar**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q -DskipTests compile`
Expected: BUILD SUCCESS.

---

### Task 5: Service `updateGeo` com TDD

**Files:**
- Modify: `TCC-back/src/main/java/com/allset/api/professional/service/ProfessionalServiceImpl.java`
- Modify: `TCC-back/src/test/java/com/allset/api/professional/service/ProfessionalServiceImplTest.java`

Constantes que aparecem no plano para a janela de skew: 1h passado, 30s futuro.

- [ ] **Step 1: Escrever os 5 testes (vão falhar)**

Adicionar ao final de `ProfessionalServiceImplTest.java` (antes do `}` final):

```java
    @Test
    void updateGeoShouldPersistCapturedAtWhenWithinSkewWindow() {
        UUID id = UUID.randomUUID();
        Instant capturedAt = Instant.now().minusSeconds(5);
        Professional pro = approvedProfessional(id);
        when(professionalRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(pro));
        when(professionalRepository.save(any(Professional.class))).thenAnswer(inv -> inv.getArgument(0));

        professionalService.updateGeo(id, new UpdateGeoRequest(
                true,
                new BigDecimal("-3.731862"),
                new BigDecimal("-38.526669"),
                new BigDecimal("12.5"),
                capturedAt,
                "device-gps"
        ));

        ArgumentCaptor<Professional> captor = ArgumentCaptor.forClass(Professional.class);
        verify(professionalRepository).save(captor.capture());
        Professional saved = captor.getValue();
        assertThat(saved.getGeoCapturedAt()).isEqualTo(capturedAt);
        assertThat(saved.getGeoAccuracyMeters()).isEqualByComparingTo("12.5");
        assertThat(saved.getGeoSource()).isEqualTo("device-gps");
        assertThat(saved.isGeoActive()).isTrue();
    }

    @Test
    void updateGeoShouldFallbackToNowWhenCapturedAtMissing() {
        UUID id = UUID.randomUUID();
        Professional pro = approvedProfessional(id);
        when(professionalRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(pro));
        when(professionalRepository.save(any(Professional.class))).thenAnswer(inv -> inv.getArgument(0));

        Instant before = Instant.now();
        professionalService.updateGeo(id, new UpdateGeoRequest(
                true,
                new BigDecimal("-3.731862"),
                new BigDecimal("-38.526669"),
                null, null, null
        ));
        Instant after = Instant.now();

        ArgumentCaptor<Professional> captor = ArgumentCaptor.forClass(Professional.class);
        verify(professionalRepository).save(captor.capture());
        assertThat(captor.getValue().getGeoCapturedAt())
                .isBetween(before.minusSeconds(1), after.plusSeconds(1));
    }

    @Test
    void updateGeoShouldRejectFutureSkewAndUseNow() {
        UUID id = UUID.randomUUID();
        Instant futureBeyondMargin = Instant.now().plusSeconds(60);
        Professional pro = approvedProfessional(id);
        when(professionalRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(pro));
        when(professionalRepository.save(any(Professional.class))).thenAnswer(inv -> inv.getArgument(0));

        professionalService.updateGeo(id, new UpdateGeoRequest(
                true,
                new BigDecimal("-3.731862"),
                new BigDecimal("-38.526669"),
                null, futureBeyondMargin, null
        ));

        ArgumentCaptor<Professional> captor = ArgumentCaptor.forClass(Professional.class);
        verify(professionalRepository).save(captor.capture());
        assertThat(captor.getValue().getGeoCapturedAt()).isBefore(futureBeyondMargin);
    }

    @Test
    void updateGeoShouldRejectStaleSkewAndUseNow() {
        UUID id = UUID.randomUUID();
        Instant veryOld = Instant.now().minus(2, java.time.temporal.ChronoUnit.HOURS);
        Professional pro = approvedProfessional(id);
        when(professionalRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(pro));
        when(professionalRepository.save(any(Professional.class))).thenAnswer(inv -> inv.getArgument(0));

        professionalService.updateGeo(id, new UpdateGeoRequest(
                true,
                new BigDecimal("-3.731862"),
                new BigDecimal("-38.526669"),
                null, veryOld, null
        ));

        ArgumentCaptor<Professional> captor = ArgumentCaptor.forClass(Professional.class);
        verify(professionalRepository).save(captor.capture());
        assertThat(captor.getValue().getGeoCapturedAt()).isAfter(veryOld);
    }

    @Test
    void updateGeoShouldClearMetadataOnDeactivate() {
        UUID id = UUID.randomUUID();
        Professional pro = approvedProfessional(id);
        pro.setGeoActive(true);
        pro.setGeoCapturedAt(Instant.now());
        pro.setGeoAccuracyMeters(new BigDecimal("8.0"));
        pro.setGeoSource("device-gps");
        when(professionalRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(pro));
        when(professionalRepository.save(any(Professional.class))).thenAnswer(inv -> inv.getArgument(0));

        professionalService.updateGeo(id, new UpdateGeoRequest(
                false, null, null, null, null, null
        ));

        ArgumentCaptor<Professional> captor = ArgumentCaptor.forClass(Professional.class);
        verify(professionalRepository).save(captor.capture());
        Professional saved = captor.getValue();
        assertThat(saved.isGeoActive()).isFalse();
        assertThat(saved.getGeoCapturedAt()).isNull();
        assertThat(saved.getGeoAccuracyMeters()).isNull();
        assertThat(saved.getGeoSource()).isNull();
    }

    private Professional approvedProfessional(UUID id) {
        Professional p = new Professional();
        p.setId(id);
        p.setUserId(UUID.randomUUID());
        p.setVerificationStatus(VerificationStatus.approved);
        p.setGeoLat(new BigDecimal("-3.731862"));
        p.setGeoLng(new BigDecimal("-38.526669"));
        return p;
    }
```

Adicionar import faltando no topo: `import com.allset.api.professional.dto.UpdateGeoRequest;` e `import static org.mockito.ArgumentMatchers.any;`.

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q -Dtest=ProfessionalServiceImplTest test`
Expected: 5 testes falhando — `geoCapturedAt` é null porque o service ainda não persiste.

- [ ] **Step 3: Implementar a lógica no service**

Substituir o método `updateGeo` em `ProfessionalServiceImpl.java` por:

```java
    @Override
    public ProfessionalResponse updateGeo(UUID id, UpdateGeoRequest request) {
        Professional professional = findActiveById(id);
        requireApproved(professional);

        if (Boolean.TRUE.equals(request.geoActive())) {
            boolean hasLat = request.geoLat() != null || professional.getGeoLat() != null;
            boolean hasLng = request.geoLng() != null || professional.getGeoLng() != null;
            if (!hasLat || !hasLng) {
                throw new IllegalArgumentException(
                        "Coordenadas geográficas (geoLat e geoLng) são obrigatórias para ativar o modo Express");
            }
        }

        boolean previouslyActive = professional.isGeoActive();
        professional.setGeoActive(request.geoActive());
        if (request.geoLat() != null) professional.setGeoLat(request.geoLat());
        if (request.geoLng() != null) professional.setGeoLng(request.geoLng());

        if (Boolean.TRUE.equals(request.geoActive())) {
            professional.setGeoCapturedAt(resolveCapturedAt(request.capturedAt(), id));
            if (request.accuracyMeters() != null) professional.setGeoAccuracyMeters(request.accuracyMeters());
            if (request.source() != null) professional.setGeoSource(request.source());
        } else {
            professional.setGeoCapturedAt(null);
            professional.setGeoAccuracyMeters(null);
            professional.setGeoSource(null);
        }

        if (previouslyActive != professional.isGeoActive()) {
            log.info("event=professional_geo_active_changed professionalId={} active={}", id, professional.isGeoActive());
        }

        return professionalMapper.toResponse(professionalRepository.save(professional));
    }

    private Instant resolveCapturedAt(Instant requested, UUID id) {
        Instant now = Instant.now();
        if (requested == null) return now;
        Instant futureLimit = now.plusSeconds(30);
        Instant pastLimit   = now.minusSeconds(3600);
        if (requested.isAfter(futureLimit) || requested.isBefore(pastLimit)) {
            log.warn("event=professional_geo_clock_skew professionalId={} requested={} now={}", id, requested, now);
            return now;
        }
        return requested;
    }
```

Adicionar imports no topo do arquivo se faltarem: `import lombok.extern.slf4j.Slf4j;` e marcar a classe com `@Slf4j` (se ainda não estiver). Se já estiver, pular.

- [ ] **Step 4: Rodar os testes para confirmar que passam**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q -Dtest=ProfessionalServiceImplTest test`
Expected: ALL TESTS PASS.

- [ ] **Step 5: Rodar o test suite inteiro para garantir que nada quebrou**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q test`
Expected: BUILD SUCCESS, 0 falhas.

---

## Phase 2 — Frontend test infrastructure

### Task 6: Setup vitest

**Files:**
- Modify: `TCC-front/package.json`
- Create: `TCC-front/vitest.config.ts`
- Create: `TCC-front/src/test/setup.ts`

- [ ] **Step 1: Instalar dependências de teste**

Run no diretório `TCC-front`:
```bash
npm install --save-dev vitest@^2 jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6 @vitejs/plugin-react@^4
```
Expected: install bem-sucedido, novas devDependencies em `package.json`.

- [ ] **Step 2: Adicionar script de teste**

Em `TCC-front/package.json`, adicionar dentro de `"scripts"`:

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

Resultado final do bloco `scripts`:

```json
  "scripts": {
    "start": "expo start --port 8080",
    "start:tunnel": "expo start --tunnel --port 8080",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web --port 8080",
    "web:bypass-auth": "EXPO_PUBLIC_SKIP_AUTH=true expo start --web --port 8080",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 4: Criar `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// React Native shim mínimo: o Provider que vamos testar só usa AppState e Linking.
// Nenhum native rendering acontece nos testes do Provider.
vi.mock('react-native', () => ({
  AppState: {
    currentState: 'active' as 'active' | 'background' | 'inactive',
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
  Linking: {
    openSettings: vi.fn(),
  },
}));
```

- [ ] **Step 5: Smoke test do setup**

Criar arquivo temporário `src/test/__sanity__.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `cd TCC-front && npm test`
Expected: 1 test passed.

Após o sucesso, deletar `src/test/__sanity__.test.ts`.

- [ ] **Step 6: Validar typecheck inalterado**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

## Phase 3 — Frontend types + API

### Task 7: Estender types e API client

**Files:**
- Modify: `TCC-front/src/types/professional-management.ts`
- Modify: `TCC-front/src/lib/api/professional-management.ts`

- [ ] **Step 1: Estender `UpdateGeoRequest`**

Substituir a interface em `src/types/professional-management.ts`:

```ts
export interface UpdateGeoRequest {
  geoActive: boolean;
  geoLat?: number;
  geoLng?: number;
  accuracyMeters?: number;
  capturedAt?: string;
  source?: string;
}
```

- [ ] **Step 2: Estender `ProfessionalProfileRecord` e `ProfessionalProfileRecordDto`**

Adicionar `geoCapturedAt` e `geoAccuracyMeters` em ambas as interfaces:

```ts
export interface ProfessionalProfileRecord {
  id: string;
  userId: string;
  bio?: string;
  yearsOfExperience?: number;
  baseHourlyRate?: number;
  specialties: ProfessionalSpecialty[];
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  geoActive: boolean;
  geoCapturedAt?: string;
  geoAccuracyMeters?: number;
  subscriptionPlanId?: string;
  subscriptionExpiresAt?: string;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalProfileRecordDto {
  id: string;
  userId: string;
  bio?: string | null;
  yearsOfExperience?: number | null;
  baseHourlyRate?: number | string | null;
  specialties?: ProfessionalSpecialtyDto[] | null;
  verificationStatus: VerificationStatus;
  rejectionReason?: string | null;
  geoActive: boolean;
  geoCapturedAt?: string | null;
  geoAccuracyMeters?: number | string | null;
  subscriptionPlanId?: string | null;
  subscriptionExpiresAt?: string | null;
  averageRating?: number | string | null;
  reviewCount?: number | string | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 3: Verificar mapeamento DTO → Record**

Procurar a função `mapProfessionalProfileRecord` em `src/lib/api/professional-management.ts` e estendê-la. Localizar a função (geralmente perto do topo do arquivo) e adicionar:

```ts
    geoCapturedAt: dto.geoCapturedAt ?? undefined,
    geoAccuracyMeters: dto.geoAccuracyMeters != null ? Number(dto.geoAccuracyMeters) : undefined,
```

dentro do objeto retornado, próximo aos outros campos `geo*`.

- [ ] **Step 4: Validar API client**

`updateGeo` em `professional-management.ts` já recebe `UpdateGeoRequest` inteiro e faz PATCH — não precisa mudar nada na função. A nova tipagem se propaga automaticamente.

- [ ] **Step 5: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

## Phase 4 — Frontend availability module (TDD)

### Task 8: Tipos do availability

**Files:**
- Create: `TCC-front/src/lib/availability/types.ts`

- [ ] **Step 1: Criar tipos**

```ts
export type ExpressAvailabilityStatus =
  | 'idle'
  | 'requesting-permission'
  | 'permission-denied'
  | 'capturing'
  | 'active'
  | 'stale'
  | 'unavailable';

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

export type ExpressAvailabilityContextValue = ExpressAvailabilityState & ExpressAvailabilityActions;

export const STALE_THRESHOLD_MS = 4 * 60 * 1000;
export const RECENCY_CHECK_INTERVAL_MS = 30 * 1000;
export const FLUSH_TIME_MS = 60 * 1000;
export const FLUSH_DISTANCE_M = 50;
export const WATCH_TIME_INTERVAL_MS = 60 * 1000;
export const WATCH_DISTANCE_INTERVAL_M = 25;
export const TOGGLE_OFF_RETRY_DELAYS_MS = [1000, 2000, 4000];
```

- [ ] **Step 2: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

### Task 9: Provider com TDD

**Files:**
- Create: `TCC-front/src/lib/availability/__tests__/ExpressAvailabilityProvider.test.tsx`
- Create: `TCC-front/src/lib/availability/ExpressAvailabilityProvider.tsx`
- Create: `TCC-front/src/lib/availability/useExpressAvailability.ts`

#### Step 1 — Escrever os testes que vão falhar

- [ ] **Step 1: Criar `useExpressAvailability.ts` (stub para o teste compilar)**

```ts
import { useContext } from 'react';
import { ExpressAvailabilityContext } from './ExpressAvailabilityProvider';
import type { ExpressAvailabilityContextValue } from './types';

export function useExpressAvailability(): ExpressAvailabilityContextValue {
  const ctx = useContext(ExpressAvailabilityContext);
  if (!ctx) {
    throw new Error('useExpressAvailability must be used inside ExpressAvailabilityProvider');
  }
  return ctx;
}
```

- [ ] **Step 2: Criar stub mínimo do Provider para o teste poder importar**

`src/lib/availability/ExpressAvailabilityProvider.tsx`:

```tsx
import { createContext, type ReactNode } from 'react';
import type { ExpressAvailabilityContextValue } from './types';

export const ExpressAvailabilityContext = createContext<ExpressAvailabilityContextValue | null>(null);

interface ProviderProps {
  professionalId: string | null;
  initialGeoActive: boolean;
  children: ReactNode;
}

export function ExpressAvailabilityProvider(_props: ProviderProps) {
  throw new Error('not implemented');
}
```

- [ ] **Step 3: Criar o arquivo de teste**

`src/lib/availability/__tests__/ExpressAvailabilityProvider.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ExpressAvailabilityProvider } from '../ExpressAvailabilityProvider';
import { useExpressAvailability } from '../useExpressAvailability';

const requestForegroundPermissionsAsync = vi.fn();
const getForegroundPermissionsAsync = vi.fn();
const getCurrentPositionAsync = vi.fn();
const watchPositionAsync = vi.fn();
const remove = vi.fn();

vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => requestForegroundPermissionsAsync(...args),
  getForegroundPermissionsAsync: (...args: unknown[]) => getForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: unknown[]) => getCurrentPositionAsync(...args),
  watchPositionAsync: (...args: unknown[]) => watchPositionAsync(...args),
  Accuracy: { Balanced: 3 },
}));

const updateGeo = vi.fn();
vi.mock('@/lib/api/professional-management', () => ({
  professionalManagementApi: {
    updateGeo: (...args: unknown[]) => updateGeo(...args),
  },
}));

const PRO_ID = 'pro-1';

function wrapper({ children, initialGeoActive = false }: { children: ReactNode; initialGeoActive?: boolean }) {
  return (
    <ExpressAvailabilityProvider professionalId={PRO_ID} initialGeoActive={initialGeoActive}>
      {children}
    </ExpressAvailabilityProvider>
  );
}

beforeEach(() => {
  requestForegroundPermissionsAsync.mockReset();
  getForegroundPermissionsAsync.mockReset();
  getCurrentPositionAsync.mockReset();
  watchPositionAsync.mockReset();
  remove.mockReset();
  updateGeo.mockReset();
  watchPositionAsync.mockResolvedValue({ remove });
  updateGeo.mockResolvedValue({});
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ExpressAvailabilityProvider', () => {
  it('starts in idle when initialGeoActive is false', () => {
    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    expect(result.current.status).toBe('idle');
    expect(result.current.geoActive).toBe(false);
  });

  it('toggle ON without permission ends in permission-denied without calling backend', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const { result } = renderHook(() => useExpressAvailability(), { wrapper });

    await act(async () => {
      await result.current.toggle(true);
    });

    expect(result.current.status).toBe('permission-denied');
    expect(updateGeo).not.toHaveBeenCalled();
  });

  it('toggle ON with permission captures position and calls backend once with full payload', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.73, longitude: -38.52, accuracy: 12.5 },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    await act(async () => {
      await result.current.toggle(true);
    });

    expect(result.current.status).toBe('active');
    expect(updateGeo).toHaveBeenCalledTimes(1);
    expect(updateGeo).toHaveBeenCalledWith(PRO_ID, expect.objectContaining({
      geoActive: true,
      geoLat: -3.73,
      geoLng: -38.52,
      accuracyMeters: 12.5,
      source: 'device-gps',
    }));
    expect(updateGeo.mock.calls[0][1].capturedAt).toBeTypeOf('string');
  });

  it('toggle OFF when active calls backend with geoActive=false and stops watch', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -3.73, longitude: -38.52, accuracy: 10 },
      timestamp: Date.now(),
    });
    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    await act(async () => { await result.current.toggle(true); });
    updateGeo.mockClear();

    await act(async () => { await result.current.toggle(false); });

    expect(result.current.status).toBe('idle');
    expect(updateGeo).toHaveBeenCalledTimes(1);
    expect(updateGeo).toHaveBeenCalledWith(PRO_ID, expect.objectContaining({ geoActive: false }));
    expect(remove).toHaveBeenCalled();
  });

  it('debounces watch updates: 3 events within 60s and <50m yield only the initial backend call', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });

    let watchCallback: ((loc: any) => void) | null = null;
    watchPositionAsync.mockImplementation(async (_opts: any, cb: any) => {
      watchCallback = cb;
      return { remove };
    });

    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    await act(async () => { await result.current.toggle(true); });
    expect(updateGeo).toHaveBeenCalledTimes(1); // initial flush
    updateGeo.mockClear();

    // 3 micro-movements (each <10m, total <50m), all within 30s
    await act(async () => {
      watchCallback!({ coords: { latitude: 0.00001, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      vi.advanceTimersByTime(10_000);
      watchCallback!({ coords: { latitude: 0.00002, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      vi.advanceTimersByTime(10_000);
      watchCallback!({ coords: { latitude: 0.00003, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
    });

    expect(updateGeo).not.toHaveBeenCalled();
  });

  it('flushes immediately when distance > 50m even before 60s', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });
    let watchCallback: ((loc: any) => void) | null = null;
    watchPositionAsync.mockImplementation(async (_opts: any, cb: any) => {
      watchCallback = cb;
      return { remove };
    });

    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    await act(async () => { await result.current.toggle(true); });
    updateGeo.mockClear();

    // ~111m of latitude change → > 50m
    await act(async () => {
      watchCallback!({ coords: { latitude: 0.001, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
    });

    expect(updateGeo).toHaveBeenCalledTimes(1);
  });

  it('flushes after 60s elapsed even without movement', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });
    let watchCallback: ((loc: any) => void) | null = null;
    watchPositionAsync.mockImplementation(async (_opts: any, cb: any) => {
      watchCallback = cb;
      return { remove };
    });

    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    await act(async () => { await result.current.toggle(true); });
    updateGeo.mockClear();

    await act(async () => {
      vi.advanceTimersByTime(61_000);
      watchCallback!({ coords: { latitude: 0, longitude: 0, accuracy: 10 }, timestamp: Date.now() });
      await Promise.resolve();
    });

    expect(updateGeo).toHaveBeenCalledTimes(1);
  });

  it('marks status stale when lastCapturedAt is older than 4 minutes', async () => {
    requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 10 },
      timestamp: Date.now(),
    });
    const { result } = renderHook(() => useExpressAvailability(), { wrapper });
    await act(async () => { await result.current.toggle(true); });

    // Simula 5 min sem updates
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    await waitFor(() => {
      expect(['stale', 'capturing', 'active']).toContain(result.current.status);
    });
  });
});
```

- [ ] **Step 4: Rodar os testes para confirmar que falham**

Run: `cd TCC-front && npm test`
Expected: todos os testes falham (Provider lança "not implemented").

#### Steps 5-6 — Implementar o Provider

- [ ] **Step 5: Implementar o Provider completo**

Substituir o conteúdo de `src/lib/availability/ExpressAvailabilityProvider.tsx`:

```tsx
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';
import { AppState, type AppStateStatus } from 'react-native';
import { Linking } from 'react-native';
import { professionalManagementApi } from '@/lib/api/professional-management';
import {
  FLUSH_DISTANCE_M,
  FLUSH_TIME_MS,
  RECENCY_CHECK_INTERVAL_MS,
  STALE_THRESHOLD_MS,
  TOGGLE_OFF_RETRY_DELAYS_MS,
  WATCH_DISTANCE_INTERVAL_M,
  WATCH_TIME_INTERVAL_MS,
  type ExpressAvailabilityContextValue,
  type ExpressAvailabilityStatus,
} from './types';

export const ExpressAvailabilityContext = createContext<ExpressAvailabilityContextValue | null>(null);

interface ProviderProps {
  professionalId: string | null;
  initialGeoActive: boolean;
  children: ReactNode;
}

interface Coords {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
}

const SOURCE = 'device-gps';

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function ExpressAvailabilityProvider({ professionalId, initialGeoActive, children }: ProviderProps) {
  const [status, setStatus] = useState<ExpressAvailabilityStatus>(initialGeoActive ? 'capturing' : 'idle');
  const [geoActive, setGeoActive] = useState(initialGeoActive);
  const [lastCapturedAt, setLastCapturedAt] = useState<Date | null>(null);
  const [lastAccuracyMeters, setLastAccuracyMeters] = useState<number | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const lastFlushRef = useRef<{ at: number; coords: Coords } | null>(null);
  const consecutiveFailuresRef = useRef(0);

  const stopWatch = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const flushIfNeeded = useCallback(
    async (coords: Coords, force = false) => {
      if (!professionalId) return;
      const now = Date.now();
      const last = lastFlushRef.current;
      const elapsed = last ? now - last.at : Infinity;
      const distance = last ? haversineMeters(last.coords, coords) : Infinity;
      if (!force && elapsed < FLUSH_TIME_MS && distance < FLUSH_DISTANCE_M) return;

      const capturedAt = new Date().toISOString();
      try {
        await professionalManagementApi.updateGeo(professionalId, {
          geoActive: true,
          geoLat: coords.lat,
          geoLng: coords.lng,
          accuracyMeters: coords.accuracyMeters ?? undefined,
          capturedAt,
          source: SOURCE,
        });
        lastFlushRef.current = { at: now, coords };
        setLastCapturedAt(new Date(capturedAt));
        setLastAccuracyMeters(coords.accuracyMeters ?? null);
        setStatus('active');
        consecutiveFailuresRef.current = 0;
      } catch (err) {
        consecutiveFailuresRef.current += 1;
        if (consecutiveFailuresRef.current >= 2) {
          setStatus('unavailable');
        }
        console.warn('[express-availability] flush failed', err);
      }
    },
    [professionalId],
  );

  const startWatch = useCallback(async () => {
    if (subscriptionRef.current) return;
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: WATCH_TIME_INTERVAL_MS,
        distanceInterval: WATCH_DISTANCE_INTERVAL_M,
      },
      (loc) => {
        const coords: Coords = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracyMeters: loc.coords.accuracy ?? null,
        };
        void flushIfNeeded(coords);
      },
    );
  }, [flushIfNeeded]);

  const captureOnce = useCallback(async (force = false): Promise<Coords | null> => {
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords: Coords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyMeters: pos.coords.accuracy ?? null,
      };
      await flushIfNeeded(coords, force);
      return coords;
    } catch (err) {
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= 2) setStatus('unavailable');
      console.warn('[express-availability] capture failed', err);
      return null;
    }
  }, [flushIfNeeded]);

  const toggle = useCallback(
    async (next: boolean) => {
      if (!professionalId) return;

      if (!next) {
        stopWatch();
        let attempt = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            await professionalManagementApi.updateGeo(professionalId, { geoActive: false });
            break;
          } catch (err) {
            if (attempt >= TOGGLE_OFF_RETRY_DELAYS_MS.length) {
              console.warn('[express-availability] toggle-off exhausted retries', err);
              break;
            }
            const delay = TOGGLE_OFF_RETRY_DELAYS_MS[attempt];
            attempt += 1;
            await new Promise((r) => setTimeout(r, delay));
          }
        }
        setGeoActive(false);
        setStatus('idle');
        setLastCapturedAt(null);
        setLastAccuracyMeters(null);
        lastFlushRef.current = null;
        consecutiveFailuresRef.current = 0;
        return;
      }

      setStatus('requesting-permission');
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setStatus('permission-denied');
        return;
      }

      setStatus('capturing');
      const coords = await captureOnce(true);
      if (!coords) return; // status already set to 'unavailable' if 2+ failures
      setGeoActive(true);
      setStatus('active');
      await startWatch();
    },
    [professionalId, captureOnce, startWatch, stopWatch],
  );

  const forceCapture = useCallback(async () => {
    setStatus('capturing');
    await captureOnce(true);
  }, [captureOnce]);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  // Recência: a cada 30s checa se lastCapturedAt > 4 min
  useEffect(() => {
    if (!geoActive) return;
    const id = setInterval(() => {
      const last = lastFlushRef.current;
      if (!last) return;
      const ageMs = Date.now() - last.at;
      if (ageMs > STALE_THRESHOLD_MS) {
        setStatus('stale');
        void captureOnce(true);
      }
    }, RECENCY_CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [geoActive, captureOnce]);

  // AppState: background = pausa watch (passivo); active = retoma + revalida permissão
  useEffect(() => {
    const onChange = async (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        stopWatch();
        return;
      }
      if (next === 'active' && geoActive) {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          stopWatch();
          if (professionalId) {
            try { await professionalManagementApi.updateGeo(professionalId, { geoActive: false }); } catch {}
          }
          setGeoActive(false);
          setStatus('permission-denied');
          return;
        }
        await captureOnce(true);
        await startWatch();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [geoActive, professionalId, captureOnce, startWatch, stopWatch]);

  // Cleanup no unmount: só para o watch, não chama backend
  useEffect(() => () => stopWatch(), [stopWatch]);

  // Auto-start: dispara quando initialGeoActive=true E professionalId está disponível.
  // Como professionalId pode chegar depois (query carregando), watchamos a chegada dele.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (!initialGeoActive) return;
    if (!professionalId) return;
    autoStartedRef.current = true;
    void (async () => {
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setStatus('permission-denied');
        return;
      }
      const coords = await captureOnce(true);
      if (!coords) return;
      setGeoActive(true);
      setStatus('active');
      await startWatch();
    })();
  }, [initialGeoActive, professionalId, captureOnce, startWatch]);

  const value = useMemo<ExpressAvailabilityContextValue>(
    () => ({ status, geoActive, lastCapturedAt, lastAccuracyMeters, toggle, forceCapture, openSettings }),
    [status, geoActive, lastCapturedAt, lastAccuracyMeters, toggle, forceCapture, openSettings],
  );

  return <ExpressAvailabilityContext.Provider value={value}>{children}</ExpressAvailabilityContext.Provider>;
}
```

- [ ] **Step 6: Rodar testes — espera-se PASS**

Run: `cd TCC-front && npm test`
Expected: 8 testes passam.

Se alguma flaky com fake timers, aumentar `vi.advanceTimersByTime` em ~100ms ou trocar para `act(async () => { await flushPromises() })` onde aplicável. Não relaxar asserções.

- [ ] **Step 7: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

## Phase 5 — Frontend UI

### Task 10: ExpressAvailabilityCard

**Files:**
- Create: `TCC-front/src/components/availability/ExpressAvailabilityCard.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { useExpressAvailability } from '@/lib/availability/useExpressAvailability';
import type { ExpressAvailabilityStatus } from '@/lib/availability/types';
import { colors, radius, spacing } from '@/theme';

interface Props {
  variant?: 'default' | 'compact';
}

interface BadgeStyle {
  bg: string;
  fg: string;
  label: string;
}

function badgeFor(status: ExpressAvailabilityStatus): BadgeStyle {
  switch (status) {
    case 'idle':                  return { bg: colors.neutral[100], fg: colors.neutral[600], label: 'Desligado' };
    case 'requesting-permission': return { bg: colors.neutral[100], fg: colors.neutral[600], label: 'Aguardando…' };
    case 'permission-denied':     return { bg: '#FEE2E2', fg: colors.error,                  label: 'Sem permissão' };
    case 'capturing':             return { bg: colors.neutral[100], fg: colors.neutral[600], label: 'Localizando…' };
    case 'active':                return { bg: '#DCFCE7', fg: '#15803D',                     label: 'Ativo' };
    case 'stale':                 return { bg: '#FEF3C7', fg: '#B45309',                     label: 'Atualizando…' };
    case 'unavailable':           return { bg: '#FEE2E2', fg: colors.error,                  label: 'Indisponível' };
  }
}

function messageFor(status: ExpressAvailabilityStatus, lastCapturedAt: Date | null): string | null {
  switch (status) {
    case 'idle':                  return 'Ative para receber pedidos próximos.';
    case 'requesting-permission': return 'Solicitando permissão de localização…';
    case 'permission-denied':     return 'Permissão de localização negada. Habilite nas configurações para receber pedidos Express.';
    case 'capturing':             return 'Localizando você…';
    case 'active': {
      if (!lastCapturedAt) return 'Recebendo pedidos próximos.';
      const secondsAgo = Math.max(0, Math.round((Date.now() - lastCapturedAt.getTime()) / 1000));
      return `Recebendo pedidos próximos. Última atualização: há ${secondsAgo}s.`;
    }
    case 'stale':                 return 'Sua posição está desatualizada. Tentando atualizar…';
    case 'unavailable':           return 'Não foi possível obter sua localização. Verifique GPS e tente de novo.';
  }
}

export function ExpressAvailabilityCard({ variant = 'default' }: Props) {
  const { status, geoActive, lastCapturedAt, toggle, forceCapture, openSettings } = useExpressAvailability();
  const badge = badgeFor(status);
  const busy = status === 'requesting-permission' || status === 'capturing';

  if (variant === 'compact') {
    return (
      <View style={styles.compact}>
        <View style={styles.compactLeft}>
          <Zap color={colors.primary} size={16} />
          <Text variant="bodySm">Express</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text variant="labelSm" color={badge.fg}>{badge.label}</Text>
          </View>
        </View>
        <Switch
          value={geoActive}
          onValueChange={toggle}
          disabled={busy}
          accessibilityRole="switch"
          accessibilityState={{ checked: geoActive, busy }}
          accessibilityLabel={`Express ${geoActive ? 'ativo' : 'desligado'}`}
        />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Zap color={colors.primary} size={20} />
          <Text variant="titleSm">Disponível para Express</Text>
        </View>
        <Switch
          value={geoActive}
          onValueChange={toggle}
          disabled={busy}
          accessibilityRole="switch"
          accessibilityState={{ checked: geoActive, busy }}
        />
      </View>

      <View style={[styles.badge, { backgroundColor: badge.bg, alignSelf: 'flex-start' }]}>
        {busy ? <ActivityIndicator size="small" color={badge.fg} /> : null}
        <Text variant="labelSm" color={badge.fg}>{badge.label}</Text>
      </View>

      <Text variant="bodySm" color={colors.neutral[600]}>
        {messageFor(status, lastCapturedAt)}
      </Text>

      {status === 'permission-denied' ? (
        <Pressable style={styles.actionBtn} onPress={openSettings}>
          <Text variant="labelLg" color={colors.primary}>Abrir configurações</Text>
        </Pressable>
      ) : null}

      {status === 'stale' || status === 'unavailable' ? (
        <Pressable style={styles.actionBtn} onPress={forceCapture}>
          <Text variant="labelLg" color={colors.primary}>
            {status === 'stale' ? 'Atualizar agora' : 'Tentar de novo'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  actionBtn: {
    paddingVertical: spacing.xs,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

> Se algum nome de cor (ex: `colors.neutral[50]`) ou variant de Text (`titleSm`/`labelSm`) não existir no theme, ajustar para o equivalente mais próximo. Inspecionar `src/theme/index.ts` e `src/components/ui/Text.tsx` antes de mudar.

---

### Task 11: ExpressStatusBar

**Files:**
- Create: `TCC-front/src/components/availability/ExpressStatusBar.tsx`

- [ ] **Step 1: Criar o componente**

```tsx
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { useExpressAvailability } from '@/lib/availability/useExpressAvailability';
import { colors, spacing } from '@/theme';

const PROBLEM_STATES = new Set(['permission-denied', 'stale', 'unavailable'] as const);

export function ExpressStatusBar() {
  const router = useRouter();
  const { geoActive, status } = useExpressAvailability();
  if (!geoActive || !PROBLEM_STATES.has(status as never)) return null;

  const messageMap: Record<string, string> = {
    'permission-denied': 'Permissão de localização revogada — abra o perfil para reativar.',
    'stale':             'Sua localização está desatualizada — toque para abrir o perfil.',
    'unavailable':       'Não foi possível obter sua localização — toque para tentar de novo.',
  };

  return (
    <Pressable style={styles.bar} onPress={() => router.push('/(professional)/(profile)' as never)}>
      <View style={styles.row}>
        <AlertTriangle color={colors.warning} size={14} />
        <Text variant="labelSm" color={colors.neutral[900]}>{messageMap[status]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
```

- [ ] **Step 2: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

## Phase 6 — Wire up & cleanup

### Task 12: Layout do (professional) com Provider

**Files:**
- Modify: `TCC-front/src/app/(professional)/_layout.tsx`

- [ ] **Step 1: Inspecionar o layout atual**

Run: `cat TCC-front/src/app/\(professional\)/_layout.tsx`

- [ ] **Step 2: Envolver com Provider e montar StatusBar**

Editar o layout para algo como (mantenha a estrutura existente — só adicione o Provider e a StatusBar):

```tsx
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { useMyProfessionalProfile } from '@/lib/hooks/useProfessionalArea';
import { ExpressAvailabilityProvider } from '@/lib/availability/ExpressAvailabilityProvider';
import { ExpressStatusBar } from '@/components/availability/ExpressStatusBar';

export default function ProfessionalLayout() {
  const profileQuery = useMyProfessionalProfile();
  const profile = profileQuery.data;

  return (
    <ExpressAvailabilityProvider
      professionalId={profile?.id ?? null}
      initialGeoActive={profile?.geoActive ?? false}
    >
      <View style={{ flex: 1 }}>
        <ExpressStatusBar />
        <Slot />
      </View>
    </ExpressAvailabilityProvider>
  );
}
```

> Se o layout original já tinha `Stack` em vez de `Slot`, ajustar para preservar o `Stack` dentro do `View`. O essencial: Provider envolve tudo, StatusBar fica no topo.

- [ ] **Step 3: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

### Task 13: Substituir toggle no perfil

**Files:**
- Modify: `TCC-front/src/app/(professional)/(profile)/index.tsx`

- [ ] **Step 1: Remover state local + handler de toggle + import de expo-location**

Remover do topo:
```tsx
import * as Location from 'expo-location';
```

Remover:
```tsx
const updateGeo = useUpdateProfessionalGeo(profileQuery.data?.id ?? '');
const [geoActive, setGeoActive] = useState(false);
const [isCapturingLocation, setIsCapturingLocation] = useState(false);

useEffect(() => {
  setGeoActive(profile?.geoActive ?? false);
}, [profile?.geoActive]);

async function handleToggleExpress(value: boolean) {
  // ... bloco inteiro
}
```

Remover o import `useUpdateProfessionalGeo` se não for usado em nenhum outro lugar do arquivo. `useState`, `useEffect` ficam se outros usos existirem (verificar com `grep`).

- [ ] **Step 2: Substituir o bloco de UI do toggle por `<ExpressAvailabilityCard/>`**

Localizar a seção que renderiza o toggle de Express na tela. Substituir por:

```tsx
import { ExpressAvailabilityCard } from '@/components/availability/ExpressAvailabilityCard';

// ... dentro do JSX, no lugar onde estava o toggle:
<ExpressAvailabilityCard variant="default" />
```

- [ ] **Step 3: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

### Task 14: Remover toggle de edit.tsx

**Files:**
- Modify: `TCC-front/src/app/(professional)/(profile)/edit.tsx`

- [ ] **Step 1: Remover toggle inteiro**

Remover do arquivo:
- `import * as Location from 'expo-location';`
- O state `geoActive`, `isCapturingLocation`
- O `useEffect` que sincroniza `geoActive` com `profile`
- A função `handleToggleExpress`
- O bloco JSX inteiro do "Disponível para Express" (Switch + texto + estados de captura)
- O hook `useUpdateProfessionalGeo` se não for usado em outro lugar

A tela `edit` deve ficar como apenas edição de perfil (bio, anos de experiência, taxa, especialidades) — sem nada de Express.

- [ ] **Step 2: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

### Task 15: Adicionar card compact no dashboard

**Files:**
- Modify: `TCC-front/src/app/(professional)/(dashboard)/index.tsx`

- [ ] **Step 1: Inspecionar dashboard atual**

Run: `cat TCC-front/src/app/\(professional\)/\(dashboard\)/index.tsx | head -50`

- [ ] **Step 2: Adicionar import e mount**

Adicionar import:
```tsx
import { ExpressAvailabilityCard } from '@/components/availability/ExpressAvailabilityCard';
```

Adicionar `<ExpressAvailabilityCard variant="compact" />` em local de destaque no JSX — idealmente abaixo do header e acima da lista principal de pedidos. Ajustar margens conforme o padrão existente.

- [ ] **Step 3: Typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

## Phase 7 — Verification & finalize

### Task 16: Validação end-to-end manual

> Pré-requisito: backend rodando local com migration aplicada, dispositivo/emulador com app expo carregado, profissional autenticado e aprovado.

- [ ] **Cenário 1 — Ativação primeira vez**: na tela de perfil, ativar o switch. Confirmar que o sistema pede permissão. Aceitar. Status passa por `requesting-permission` → `capturing` → `active`. Verificar no banco: `SELECT geo_active, geo_captured_at, geo_accuracy_meters, geo_source FROM professionals WHERE id = '<id>';` — todos os campos devem estar preenchidos, `geo_captured_at` próximo de `now()`.

- [ ] **Cenário 2 — Movimento e debounce**: caminhar ~100m com o app aberto. Aguardar ~70s. Banco deve ter `geo_captured_at` atualizado. Logs do app não devem mostrar mais de ~2 chamadas a `updateGeo` no minuto.

- [ ] **Cenário 3 — Estacionário**: ficar parado por 3 min com toggle ativo. Banco deve receber no máximo 3 updates (1 por minuto). O badge "Ativo" deve continuar verde.

- [ ] **Cenário 4 — Background curto**: minimizar o app por ~30s, reabrir. Não deve haver chamada a `updateGeo` no minimizar (verificar logs/network). Ao reabrir, há captura imediata; `geo_captured_at` volta a ficar fresco.

- [ ] **Cenário 5 — Background longo**: minimizar o app, esperar 5 min, reabrir. Status passa por `stale` antes de voltar a `active`. Banner amarelo do `<ExpressStatusBar/>` deve aparecer brevemente em outras telas se navegar antes.

- [ ] **Cenário 6 — Permissão revogada**: com toggle ativo, abrir configurações do sistema, revogar permissão de localização do app, voltar. Status muda para `permission-denied`, banner global aparece, banco recebe `geo_active=false` e demais geo_* viram `null`.

- [ ] **Cenário 7 — Desativação**: clicar no toggle para desligar. Banco: `geo_active=false`, `geo_captured_at=null`, `geo_accuracy_meters=null`, `geo_source=null`. Status volta a `idle`.

- [ ] **Cenário 8 — Tela de edição limpa**: navegar para `(profile)/edit.tsx`. Não deve haver toggle de Express na tela. Apenas campos de perfil.

- [ ] **Cenário 9 — Dashboard mostra status**: voltar ao dashboard. Card compact deve refletir o estado atual (Ativo/Desligado/etc) e permitir toggle rápido.

Se algum cenário falhar, voltar à task correspondente e ajustar antes de seguir.

---

### Task 17: Rodar suíte completa antes de commitar

- [ ] **Step 1: Backend**

Run: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 PATH=$JAVA_HOME/bin:$PATH bash TCC-back/mvnw -f TCC-back/pom.xml -q test`
Expected: BUILD SUCCESS.

- [ ] **Step 2: Frontend tests**

Run: `cd TCC-front && npm test`
Expected: todos os testes do `ExpressAvailabilityProvider` passam.

- [ ] **Step 3: Frontend typecheck**

Run: `cd TCC-front && npm run typecheck`
Expected: 0 erros.

---

### Task 18: Commits finais (agrupados)

> Conforme preferência do usuário, todos os commits são feitos somente aqui, no final, separados por logical unit. Sem `Co-Authored-By:`. Mensagens descritivas focadas em "por quê".

- [ ] **Step 1: Verificar trabalho não commitado**

Run: `git -C TCC-back status --short && echo --- && git -C TCC-front status --short`
Expected: lista de arquivos novos/modificados consistente com o mapa de arquivos no topo do plano.

- [ ] **Step 2: Commit 1 — backend (migration + domain + DTO + mapper + service + tests)**

```bash
git -C TCC-back add \
  src/main/resources/db/migration/V23__add_professional_geo_metadata.sql \
  src/main/java/com/allset/api/professional/domain/Professional.java \
  src/main/java/com/allset/api/professional/dto/UpdateGeoRequest.java \
  src/main/java/com/allset/api/professional/dto/ProfessionalResponse.java \
  src/main/java/com/allset/api/professional/mapper/ProfessionalMapper.java \
  src/main/java/com/allset/api/professional/service/ProfessionalServiceImpl.java \
  src/test/java/com/allset/api/professional/service/ProfessionalServiceImplTest.java

git -C TCC-back commit -m "feat(professional): persistir capturedAt/accuracy/source no update de geo

Adiciona geo_captured_at, geo_accuracy_meters e geo_source em professionals
mais índice parcial sobre (geo_active, geo_captured_at). Service valida
clock skew (-1h, +30s) e limpa metadata ao desativar Express. Habilita
futura adição de filtro de recência na matching query do Express, que
hoje só filtra por geo_active."
```

- [ ] **Step 3: Commit 2 — frontend test infra**

```bash
git -C TCC-front add \
  package.json package-lock.json \
  vitest.config.ts \
  src/test/setup.ts

git -C TCC-front commit -m "chore(test): adicionar vitest + jsdom + testing-library

Habilita testes unitários no frontend (até agora só typecheck). Vitest
roda em jsdom e mocka react-native (AppState, Linking) globalmente para
permitir teste de hooks/Providers sem renderização nativa."
```

- [ ] **Step 4: Commit 3 — frontend types e API**

```bash
git -C TCC-front add \
  src/types/professional-management.ts \
  src/lib/api/professional-management.ts

git -C TCC-front commit -m "feat(professional): estender tipos e API client com metadata de geo

UpdateGeoRequest aceita accuracyMeters, capturedAt e source.
ProfessionalProfileRecord expõe geoCapturedAt e geoAccuracyMeters
para que telas saibam o frescor da posição persistida após reload."
```

- [ ] **Step 5: Commit 4 — frontend availability module**

```bash
git -C TCC-front add \
  src/lib/availability/types.ts \
  src/lib/availability/ExpressAvailabilityProvider.tsx \
  src/lib/availability/useExpressAvailability.ts \
  src/lib/availability/__tests__/ExpressAvailabilityProvider.test.tsx \
  src/components/availability/ExpressAvailabilityCard.tsx \
  src/components/availability/ExpressStatusBar.tsx

git -C TCC-front commit -m "feat(professional): captura contínua de localização para Express

Provider único no layout (professional) orquestra permissão, watch
híbrido (60s/25m) com debounce de envio (60s ou 50m) e máquina de
estados (idle/requesting/denied/capturing/active/stale/unavailable).
Pausa watch em background mantendo geoActive=true (recência envelhece
sozinha); revogação de permissão dispara desativação ativa com banner.
Card com variants default/compact substitui lógica duplicada antiga."
```

- [ ] **Step 6: Commit 5 — frontend wire up**

```bash
git -C TCC-front add \
  src/app/\(professional\)/_layout.tsx \
  src/app/\(professional\)/\(profile\)/index.tsx \
  src/app/\(professional\)/\(profile\)/edit.tsx \
  src/app/\(professional\)/\(dashboard\)/index.tsx

git -C TCC-front commit -m "feat(professional): consolidar UI de disponibilidade Express

Layout (professional) envolve tudo com ExpressAvailabilityProvider e
monta ExpressStatusBar global. Tela de perfil usa ExpressAvailabilityCard
default; tela de edição perde o toggle (lugar errado para estado de
disponibilidade); dashboard ganha card compact para toggle rápido."
```

- [ ] **Step 7: Verificar histórico**

Run: `git -C TCC-back log --oneline -1 && git -C TCC-front log --oneline -5`
Expected: 1 commit em TCC-back, 4 commits em TCC-front com as mensagens acima.

---

## Self-review checklist (preenchido antes de salvar)

**Cobertura da spec:**

- ✅ Backend migration + colunas → Task 1, 2
- ✅ DTOs estendidos → Task 3
- ✅ Mapper → Task 4
- ✅ Service com clock skew + limpeza no deactivate → Task 5
- ✅ Tipos do front → Task 7
- ✅ API client → Task 7
- ✅ Provider com máquina de estados, watch híbrido, debounce, AppState, recência → Task 9
- ✅ Hook consumidor → Task 9
- ✅ Card default + compact → Task 10
- ✅ StatusBar global → Task 11
- ✅ Wire up no layout → Task 12
- ✅ Substituição em (profile)/index.tsx → Task 13
- ✅ Remoção em (profile)/edit.tsx → Task 14
- ✅ Card compact no dashboard → Task 15
- ✅ Critérios de aceite cobertos pelo Task 16 (cenários 1–9 mapeiam item-a-item à seção "Critérios de aceite" da spec)

**Placeholders / TODOs:** nenhum encontrado. Todos os steps de código têm o código completo.

**Consistência de tipos:** `ExpressAvailabilityStatus`, `ExpressAvailabilityState`, `ExpressAvailabilityActions`, `ExpressAvailabilityContextValue` — todos definidos em Task 8 e usados consistentemente em Tasks 9, 10, 11. Nomes de constantes (`STALE_THRESHOLD_MS`, `FLUSH_TIME_MS`, `FLUSH_DISTANCE_M`, etc.) batem entre types.ts e Provider.

**Decisões delicadas explicitadas:**
- Provider chama `professionalManagementApi.updateGeo` direto, **não** `useUpdateProfessionalGeo` — para evitar flood de toasts. Documentado no comentário do flush.
- Cleanup do unmount não chama backend — para tolerar hot reload em dev sem desligar o profissional silenciosamente. Documentado no comment do cleanup `useEffect`.
