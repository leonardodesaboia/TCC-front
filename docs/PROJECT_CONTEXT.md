# Resumo Completo do Backend para o Frontend

## 1. Visão geral

Este backend é uma API REST em Spring Boot para a plataforma **All Set**, um marketplace de serviços.  
Os módulos principais hoje são:

- autenticação e sessão
- usuários
- endereços
- perfis profissionais
- documentos/KYC
- catálogo de áreas e categorias
- serviços ofertados por profissionais
- assinatura de profissionais
- agenda/bloqueios
- pedidos Express
- chat
- notificações
- avaliações
- disputas

### Stack técnica

- Java 21
- Spring Boot 3.5
- PostgreSQL
- Redis
- Flyway
- JWT Bearer
- MinIO para arquivos
- STOMP/WebSocket para chat em tempo real

### Arquitetura

O projeto segue arquitetura em camadas por domínio:

- `controller`: recebe HTTP e valida DTOs
- `service`: regra de negócio
- `repository`: acesso ao banco via JPA
- `domain`: entidades/enums
- `dto`: contratos de entrada e saída

Fluxo padrão:

`request HTTP -> controller -> service -> repository -> banco -> mapper/DTO -> response`

## 2. Convenções globais da API

### Base paths

- autenticação: `/api/auth`
- usuários: `/api/users`
- demais módulos: `/api/v1/...`
- WebSocket/SockJS: `/ws`

### Autenticação

- O backend usa `Authorization: Bearer <accessToken>`.
- O `accessToken` contém:
  - `sub`: `UUID` do usuário
  - `role`: `client`, `professional` ou `admin`
- O `refreshToken` é outro JWT com claim `type=refresh`.
- Refresh token é salvo no Redis por usuário.

### Segurança real no código atual

Importante: vários controllers ainda têm `@PreAuthorize` comentado.  
Na prática:

- `POST /api/users` e `POST /api/v1/professionals` são públicos
- `/api/auth/**`, `/actuator/health`, `/v3/api-docs/**`, `/swagger-ui/**` e `/ws/**` são públicos
- grande parte dos endpoints restantes exige apenas autenticação
- as restrições por role/ownership estão realmente ativas principalmente em:
  - pedidos
  - disputas
  - reviews
  - acesso por participante no chat

Ou seja: a documentação Swagger fala em vários casos "admin only" ou "owner only", mas isso ainda não está 100% aplicado em todos os módulos.

### Paginação

Onde a resposta é paginada, o backend retorna `Page<T>` padrão do Spring.  
O frontend deve esperar algo como:

```json
{
  "content": [],
  "pageable": {},
  "totalElements": 0,
  "totalPages": 0,
  "size": 20,
  "number": 0,
  "sort": {},
  "first": true,
  "last": true,
  "numberOfElements": 0,
  "empty": true
}
```

### Resposta de erro padrão

```json
{
  "status": 400,
  "message": "Validation failed",
  "fields": {
    "email": "Email inválido"
  },
  "timestamp": "2026-04-27T12:00:00Z"
}
```

### Status HTTP mais usados

- `200`: sucesso
- `201`: criado
- `204`: sem corpo
- `400`: validação ou regra de negócio
- `401`: token inválido/ausente ou credenciais inválidas
- `403`: acesso negado/conta banida
- `404`: recurso não encontrado ou usuário sem permissão
- `409`: conflito
- `413`: upload acima do limite
- `422`: sem profissionais disponíveis no Express
- `423`: conta em janela de exclusão

## 3. Domínio e como a aplicação funciona

### Usuário

`User` é a raiz da identidade.  
Campos importantes:

- role
- password
- active
- banReason
- deletedAt
- notificationsEnabled
- avatarUrl

CPF é tratado de duas formas:

- valor original criptografado em banco
- hash SHA-256 para unicidade e busca

### Profissional

O profissional é um perfil 1:1 ligado a `User`.

Campos importantes:

- bio
- yearsOfExperience
- baseHourlyRate
- verificationStatus
- geoActive
- geoLat / geoLng
- subscriptionPlanId
- subscriptionExpiresAt

### Catálogo

O catálogo tem 3 níveis:

1. `service_areas`
2. `service_categories`
3. `professional_services`

O pedido Express usa principalmente:

- `areaId`
- `categoryId`

### Pedido Express

Esse é o núcleo mais importante do backend hoje.

Fluxo:

1. cliente cria pedido Express
2. backend valida endereço e categoria
3. backend busca profissionais próximos por categoria e geolocalização
4. cria a ordem com status `pending`
5. cria fila `express_queue` para todos os profissionais notificados
6. profissional aceita ou rejeita
7. quando chega a primeira proposta aceita, abre a janela do cliente escolher
8. cliente escolhe um profissional
9. pedido vai para `accepted`
10. backend cria automaticamente a conversa do chat
11. profissional conclui com foto
12. cliente confirma conclusão
13. se houver problema, cliente pode abrir disputa dentro da janela

### Chat

O chat só nasce quando o pedido vira `accepted`.  
Ou seja: não existe conversa antes de o cliente escolher a proposta.

### Reviews

As avaliações têm um comportamento importante:

- cliente pode avaliar profissional com nota + comentário obrigatório
- profissional pode avaliar cliente só com nota, sem comentário
- avaliações são publicadas:
  - imediatamente, quando os dois lados já avaliaram
  - ou depois de 7 dias via scheduler

### Disputas

Disputa só pode ser aberta quando o pedido está em `completed_by_pro` e ainda dentro da janela de 24h após a conclusão do profissional.

### Pagamento

O fluxo já calcula:

- `baseAmount`
- `platformFee`
- `totalAmount`

Mas a integração real com pagamento/escrow ainda está `TODO`.  
Então hoje o backend já modela o fluxo, mas ainda não liquida pagamento de verdade.

## 4. Arquivos e uploads

Uploads existentes:

- avatar de usuário
- documentos do profissional
- fotos do pedido
- anexos de chat
- ícones de catálogo
- evidências de disputa

### Buckets e visibilidade

- `AVATARS`: privado
- `DOCUMENTS`: privado
- `ORDER_PHOTOS`: privado
- `CHAT_ATTACHMENTS`: privado
- `CATALOG_ICONS`: público
- `DISPUTE_EVIDENCES`: privado

### MIME types aceitos

- avatar: `image/jpeg`, `image/png`
- documento: `image/jpeg`, `image/png`, `application/pdf`
- order photo: `image/jpeg`, `image/png`
- chat attachment: `image/jpeg`, `image/png`
- category/area icon: `image/png`, `image/svg+xml`
- dispute evidence: `image/jpeg`, `image/png`

### Observação importante para o frontend

Buckets privados retornam `StorageRefResponse` com:

- `key`
- `downloadUrl`
- `urlExpiresAt`

Buckets públicos retornam `downloadUrl` sem expiração.

## 5. Tempo real: WebSocket do chat

### Endpoint

- SockJS/STOMP: `/ws`

### Autenticação do CONNECT

No frame STOMP `CONNECT`, o frontend deve enviar:

- header `Authorization: Bearer <accessToken>`

### Subscrição

- tópico da conversa: `/topic/conversations/{conversationId}`

O backend valida se o usuário autenticado é participante da conversa antes de permitir o subscribe.

### Eventos publicados no tópico

- `MessageResponse`
- `ReadReceiptEvent`
- `DeliveryReceiptEvent`

## 6. Rotas por módulo

### 6.1 Auth

- `POST /api/auth/login`
  - body: `LoginRequest`
  - response: `TokenResponse`
- `POST /api/auth/refresh`
  - body: `RefreshTokenRequest`
  - response: `TokenResponse`
- `POST /api/auth/logout`
  - body: `RefreshTokenRequest`
  - response: `204`
- `POST /api/auth/forgot-password`
  - body: `ForgotPasswordRequest`
  - response: `204`
- `POST /api/auth/reset-password`
  - body: `ResetPasswordRequest`
  - response: `204`

### 6.2 Users

- `POST /api/users`
  - público
  - body: `CreateUserRequest`
  - response: `UserResponse`
- `GET /api/users?banned=false&deleted=false`
  - response: `Page<UserResponse>`
- `GET /api/users/{id}`
  - response: `UserResponse`
- `PUT /api/users/{id}`
  - body: `UpdateUserRequest`
  - response: `UserResponse`
- `DELETE /api/users/{id}`
  - soft delete
  - response: `UserResponse`
- `PATCH /api/users/{id}/reactivate`
  - response: `UserResponse`
- `PATCH /api/users/{id}/ban`
  - body: `BanUserRequest`
  - response: `UserResponse`
- `PATCH /api/users/{id}/activate`
  - response: `UserResponse`
- `POST /api/users/{id}/avatar`
  - multipart: `file`
  - response: `UserResponse`
- `DELETE /api/users/{id}/avatar`
  - response: `UserResponse`

### 6.3 Saved Addresses

- `POST /api/users/{userId}/addresses`
  - body: `CreateSavedAddressRequest`
  - response: `SavedAddressResponse`
- `GET /api/users/{userId}/addresses`
  - response: `List<SavedAddressResponse>`
- `GET /api/users/{userId}/addresses/{id}`
  - response: `SavedAddressResponse`
- `PUT /api/users/{userId}/addresses/{id}`
  - body: `UpdateSavedAddressRequest`
  - response: `SavedAddressResponse`
- `DELETE /api/users/{userId}/addresses/{id}`
  - response: `204`
- `PATCH /api/users/{userId}/addresses/{id}/set-default`
  - response: `SavedAddressResponse`

### 6.4 Professionals

- `POST /api/v1/professionals`
  - público
  - body: `CreateProfessionalRequest`
  - response: `ProfessionalResponse`
- `GET /api/v1/professionals?status=&geoActive=false`
  - response: `Page<ProfessionalResponse>`
- `GET /api/v1/professionals/{id}`
  - response: `ProfessionalResponse`
- `PUT /api/v1/professionals/{id}`
  - body: `UpdateProfessionalRequest`
  - response: `ProfessionalResponse`
- `PATCH /api/v1/professionals/{id}/geo`
  - body: `UpdateGeoRequest`
  - response: `ProfessionalResponse`
- `PATCH /api/v1/professionals/{id}/verify`
  - body: `VerifyProfessionalRequest`
  - response: `ProfessionalResponse`
- `DELETE /api/v1/professionals/{id}`
  - response: `204`

### 6.5 Professional Documents

- `POST /api/v1/professionals/{professionalId}/documents`
  - multipart:
    - `docType`
    - `file`
  - response: `ProfessionalDocumentResponse`
- `GET /api/v1/professionals/{professionalId}/documents`
  - response: `List<ProfessionalDocumentResponse>`
- `DELETE /api/v1/professionals/{professionalId}/documents/{id}`
  - response: `204`

### 6.6 Professional Services / Offerings

- `POST /api/v1/professionals/{professionalId}/services`
  - body: `CreateProfessionalOfferingRequest`
  - response: `ProfessionalOfferingResponse`
- `GET /api/v1/professionals/{professionalId}/services?includeInactive=false`
  - response: `Page<ProfessionalOfferingResponse>`
- `GET /api/v1/professionals/{professionalId}/services/{id}`
  - response: `ProfessionalOfferingResponse`
- `PUT /api/v1/professionals/{professionalId}/services/{id}`
  - body: `UpdateProfessionalOfferingRequest`
  - response: `ProfessionalOfferingResponse`
- `DELETE /api/v1/professionals/{professionalId}/services/{id}`
  - response: `204`

### 6.7 Service Areas

- `POST /api/v1/service-areas`
  - body: `CreateServiceAreaRequest`
  - response: `ServiceAreaResponse`
- `GET /api/v1/service-areas?includeInactive=false`
  - response: `Page<ServiceAreaResponse>`
- `GET /api/v1/service-areas/{id}`
  - response: `ServiceAreaResponse`
- `PUT /api/v1/service-areas/{id}`
  - body: `UpdateServiceAreaRequest`
  - response: `ServiceAreaResponse`
- `DELETE /api/v1/service-areas/{id}`
  - response: `204`
- `PUT /api/v1/service-areas/{id}/icon`
  - multipart: `file`
  - response: `ServiceAreaResponse`
- `DELETE /api/v1/service-areas/{id}/icon`
  - response: `ServiceAreaResponse`

### 6.8 Service Categories

- `POST /api/v1/service-categories`
  - body: `CreateServiceCategoryRequest`
  - response: `ServiceCategoryResponse`
- `GET /api/v1/service-categories?areaId=&includeInactive=false`
  - response: `Page<ServiceCategoryResponse>`
- `GET /api/v1/service-categories/{id}`
  - response: `ServiceCategoryResponse`
- `PUT /api/v1/service-categories/{id}`
  - body: `UpdateServiceCategoryRequest`
  - response: `ServiceCategoryResponse`
- `DELETE /api/v1/service-categories/{id}`
  - response: `204`
- `PUT /api/v1/service-categories/{id}/icon`
  - multipart: `file`
  - response: `ServiceCategoryResponse`
- `DELETE /api/v1/service-categories/{id}/icon`
  - response: `ServiceCategoryResponse`

### 6.9 Subscription Plans

- `POST /api/v1/subscription-plans`
  - body: `CreateSubscriptionPlanRequest`
  - response: `SubscriptionPlanResponse`
- `GET /api/v1/subscription-plans?includeInactive=false`
  - response: `Page<SubscriptionPlanResponse>`
- `GET /api/v1/subscription-plans/{id}`
  - response: `SubscriptionPlanResponse`
- `PUT /api/v1/subscription-plans/{id}`
  - body: `UpdateSubscriptionPlanRequest`
  - response: `SubscriptionPlanResponse`
- `DELETE /api/v1/subscription-plans/{id}`
  - response: `204`

### 6.10 Professional Subscription

- `GET /api/v1/professionals/{professionalId}/subscription`
  - response: `ProfessionalSubscriptionResponse`
- `PUT /api/v1/professionals/{professionalId}/subscription`
  - body: `AssignSubscriptionPlanRequest`
  - response: `ProfessionalSubscriptionResponse`
- `POST /api/v1/professionals/{professionalId}/subscription/cancel`
  - response: `CancelSubscriptionResponse`

### 6.11 Calendar / Blocked Periods

- `POST /api/v1/professionals/{professionalId}/calendar/blocks`
  - body: `CreateBlockedPeriodRequest`
  - response: `BlockedPeriodResponse`
- `GET /api/v1/professionals/{professionalId}/calendar/blocks`
  - response: `List<BlockedPeriodResponse>`
- `DELETE /api/v1/professionals/{professionalId}/calendar/blocks/{id}`
  - response: `204`

### 6.12 Orders

- `POST /api/v1/orders/express`
  - role: `client`
  - body: `CreateExpressOrderRequest`
  - response: `OrderResponse`
- `GET /api/v1/orders/{id}`
  - response: `OrderResponse`
- `GET /api/v1/orders?status=`
  - response: `Page<OrderResponse>`
- `GET /api/v1/orders/{id}/express/proposals`
  - roles: `client`, `admin`
  - response: `List<ExpressProposalResponse>`
- `POST /api/v1/orders/{id}/express/pro-respond`
  - role: `professional`
  - body: `ProRespondRequest`
  - response: `OrderResponse`
- `POST /api/v1/orders/{id}/express/client-respond`
  - role: `client`
  - body: `ClientRespondRequest`
  - response: `OrderResponse`
- `POST /api/v1/orders/{id}/complete`
  - role: `professional`
  - multipart: `file`
  - response: `OrderResponse`
- `POST /api/v1/orders/{id}/photos`
  - roles: `client`, `professional`, `admin`
  - multipart:
    - `type`
    - `file`
  - response: `OrderPhotoResponse`
- `POST /api/v1/orders/{id}/confirm`
  - role: `client`
  - response: `OrderResponse`
- `POST /api/v1/orders/{id}/cancel`
  - roles: `client`, `professional`
  - body: `CancelOrderRequest`
  - response: `OrderResponse`

### 6.13 Conversations / Chat

- `GET /api/v1/conversations`
  - response: `Page<ConversationSummaryResponse>`
- `GET /api/v1/conversations/{id}`
  - response: `ConversationResponse`
- `GET /api/v1/conversations/{id}/messages`
  - response: `Page<MessageResponse>`
- `POST /api/v1/conversations/{id}/messages`
  - body: `SendMessageRequest`
  - response: `MessageResponse`
- `POST /api/v1/conversations/{id}/messages/image`
  - multipart: `file`
  - response: `MessageResponse`
- `PATCH /api/v1/conversations/{id}/read`
  - response: `ReadReceiptEvent`

### 6.14 Notifications

- `GET /api/v1/notifications`
  - response: `Page<NotificationResponse>`
- `PATCH /api/v1/notifications/{id}/read`
  - response: `NotificationResponse`
- `PATCH /api/v1/notifications/read-all`
  - response: `MarkAllNotificationsReadResponse`
- `GET /api/v1/notifications/preferences`
  - response: `NotificationPreferenceResponse`
- `PATCH /api/v1/notifications/preferences`
  - body: `UpdateNotificationPreferenceRequest`
  - response: `NotificationPreferenceResponse`

### 6.15 Push Tokens

- `GET /api/v1/push-tokens`
  - response: `List<PushTokenResponse>`
- `POST /api/v1/push-tokens`
  - body: `RegisterPushTokenRequest`
  - response: `PushTokenResponse`
- `DELETE /api/v1/push-tokens/{id}`
  - response: `204`

### 6.16 Reviews

- `POST /api/v1/orders/{orderId}/reviews`
  - roles: `client`, `professional`
  - body: `CreateReviewRequest`
  - response: `ReviewResponse`
- `GET /api/v1/orders/{orderId}/reviews`
  - response: `List<ReviewResponse>`
- `GET /api/v1/professionals/{professionalId}/reviews`
  - response: `Page<ReviewResponse>`
- `GET /api/v1/professionals/{professionalId}/services/{serviceId}/reviews`
  - response: `Page<ReviewResponse>`

### 6.17 Disputes

- `POST /api/v1/orders/{orderId}/disputes`
  - role: `client`
  - body: `OpenDisputeRequest`
  - response: `DisputeResponse`
- `GET /api/v1/orders/{orderId}/disputes`
  - response: `DisputeResponse`
- `GET /api/v1/disputes/{id}`
  - response: `DisputeResponse`
- `GET /api/v1/disputes?status=`
  - role: `admin`
  - response: `Page<DisputeResponse>`
- `PATCH /api/v1/disputes/{id}/under-review`
  - role: `admin`
  - response: `DisputeResponse`
- `POST /api/v1/disputes/{id}/resolve`
  - role: `admin`
  - body: `ResolveDisputeRequest`
  - response: `DisputeResponse`
- `POST /api/v1/disputes/{id}/evidences`
  - body: `AddTextEvidenceRequest`
  - response: `DisputeEvidenceResponse`
- `POST /api/v1/disputes/{id}/evidences/photo`
  - multipart:
    - `file`
    - `caption` opcional
  - response: `DisputeEvidenceResponse`
- `GET /api/v1/disputes/{id}/evidences`
  - response: `List<DisputeEvidenceResponse>`

## 7. DTOs principais

## 7.1 Auth DTOs

### `LoginRequest`

```json
{
  "email": "string",
  "password": "string"
}
```

### `RefreshTokenRequest`

```json
{
  "refreshToken": "string"
}
```

### `ForgotPasswordRequest`

```json
{
  "email": "string"
}
```

### `ResetPasswordRequest`

```json
{
  "email": "string",
  "code": "1234",
  "newPassword": "string"
}
```

### `TokenResponse`

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

## 7.2 User / Address DTOs

### `CreateUserRequest`

```json
{
  "name": "string",
  "cpf": "string",
  "email": "string",
  "phone": "+5511999999999",
  "password": "string",
  "role": "client|professional|admin"
}
```

### `UpdateUserRequest`

```json
{
  "name": "string?",
  "email": "string?",
  "phone": "string?"
}
```

### `UserResponse`

Campos:

- `id`
- `name`
- `email`
- `phone`
- `role`
- `avatar: StorageRefResponse|null`
- `active`
- `banReason`
- `averageRating`
- `reviewCount`
- `createdAt`
- `updatedAt`
- `scheduledDeletionAt`

### `CreateSavedAddressRequest`

```json
{
  "label": "Casa",
  "street": "Rua X",
  "number": "100",
  "complement": "Apto 2",
  "district": "Centro",
  "city": "Fortaleza",
  "state": "CE",
  "zipCode": "60000-000",
  "lat": -3.73,
  "lng": -38.52,
  "isDefault": true
}
```

### `UpdateSavedAddressRequest`

Mesmos campos, mas todos opcionais e `isDefault` é `Boolean` nullable.

### `SavedAddressResponse`

Campos:

- `id`
- `userId`
- `label`
- `street`
- `number`
- `complement`
- `district`
- `city`
- `state`
- `zipCode`
- `lat`
- `lng`
- `isDefault`
- `createdAt`
- `updatedAt`

## 7.3 Professional / Catalog / Subscription DTOs

### `CreateProfessionalRequest`

```json
{
  "userId": "uuid",
  "bio": "string",
  "yearsOfExperience": 5,
  "baseHourlyRate": 80.00
}
```

### `ProfessionalResponse`

Campos:

- `id`
- `userId`
- `bio`
- `yearsOfExperience`
- `baseHourlyRate`
- `verificationStatus`
- `rejectionReason`
- `geoActive`
- `subscriptionPlanId`
- `subscriptionExpiresAt`
- `averageRating`
- `reviewCount`
- `createdAt`
- `updatedAt`

### `UpdateGeoRequest`

```json
{
  "geoActive": true,
  "geoLat": -3.731862,
  "geoLng": -38.526669
}
```

### `VerifyProfessionalRequest`

```json
{
  "status": "approved|rejected",
  "rejectionReason": "string?"
}
```

### `CreateProfessionalOfferingRequest`

```json
{
  "categoryId": "uuid",
  "title": "Instalação elétrica",
  "description": "string",
  "pricingType": "hourly|fixed",
  "price": 120.00,
  "estimatedDurationMinutes": 60
}
```

### `ProfessionalOfferingResponse`

Campos:

- `id`
- `professionalId`
- `categoryId`
- `title`
- `description`
- `pricingType`
- `price`
- `estimatedDurationMinutes`
- `active`
- `averageRating`
- `reviewCount`
- `createdAt`

### `CreateServiceAreaRequest`

```json
{
  "name": "Elétrica"
}
```

### `CreateServiceCategoryRequest`

```json
{
  "areaId": "uuid",
  "name": "Eletricista"
}
```

### `ServiceAreaResponse`

- `id`
- `name`
- `icon: StorageRefResponse|null`
- `active`
- `createdAt`

### `ServiceCategoryResponse`

- `id`
- `areaId`
- `name`
- `icon: StorageRefResponse|null`
- `active`
- `createdAt`

### `CreateSubscriptionPlanRequest`

```json
{
  "name": "Plano Pro",
  "priceMonthly": 49.90,
  "highlightInSearch": true,
  "expressPriority": true,
  "badgeLabel": "Pro",
  "active": true
}
```

### `SubscriptionPlanResponse`

- `id`
- `name`
- `priceMonthly`
- `highlightInSearch`
- `expressPriority`
- `badgeLabel`
- `active`
- `createdAt`

### `ProfessionalSubscriptionResponse`

- `professionalId`
- `subscriptionPlanId`
- `planName`
- `priceMonthly`
- `highlightInSearch`
- `expressPriority`
- `badgeLabel`
- `subscriptionExpiresAt`
- `autoRenew`
- `subscriptionCancelledAt`

## 7.4 Order DTOs

### `CreateExpressOrderRequest`

```json
{
  "areaId": "uuid",
  "categoryId": "uuid",
  "description": "string",
  "addressId": "uuid",
  "urgencyFee": 15.00
}
```

### `ProRespondRequest`

```json
{
  "response": "accepted|rejected|timeout",
  "proposedAmount": 150.00
}
```

Regra:

- `proposedAmount` é obrigatório quando `response = accepted`

### `ClientRespondRequest`

```json
{
  "selectedProfessionalId": "uuid"
}
```

### `CancelOrderRequest`

```json
{
  "reason": "string"
}
```

### `OrderResponse`

Campos:

- `id`
- `clientId`
- `professionalId`
- `serviceId`
- `areaId`
- `categoryId`
- `mode`
- `status`
- `description`
- `addressId`
- `addressSnapshot`
- `scheduledAt`
- `expiresAt`
- `urgencyFee`
- `baseAmount`
- `platformFee`
- `totalAmount`
- `searchRadiusKm`
- `searchAttempts`
- `proCompletedAt`
- `disputeDeadline`
- `completedAt`
- `cancelledAt`
- `cancelReason`
- `version`
- `createdAt`
- `updatedAt`
- `photos: List<OrderPhotoResponse>`

### `ExpressProposalResponse`

- `professionalId`
- `proposedAmount`
- `respondedAt`
- `queuePosition`

### `OrderPhotoResponse`

- `id`
- `type`
- `uploaderId`
- `file: StorageRefResponse`
- `uploadedAt`

## 7.5 Chat DTOs

### `ConversationResponse`

- `id`
- `orderId`
- `clientId`
- `professionalUserId`
- `createdAt`

### `ConversationSummaryResponse`

- `id`
- `orderId`
- `otherParticipantId`
- `lastMessage`
- `unreadCount`

### `SendMessageRequest`

```json
{
  "content": "string"
}
```

### `MessageResponse`

- `id`
- `conversationId`
- `senderId`
- `msgType`
- `content`
- `attachment: StorageRefResponse|null`
- `attachmentSizeBytes`
- `attachmentMimeType`
- `sentAt`
- `deliveredAt`
- `readAt`

### `ReadReceiptEvent`

- `eventType`
- `conversationId`
- `readerUserId`
- `readAt`
- `affectedCount`

### `DeliveryReceiptEvent`

- `eventType`
- `conversationId`
- `receiverUserId`
- `deliveredAt`
- `affectedCount`

## 7.6 Notification DTOs

### `RegisterPushTokenRequest`

```json
{
  "expoToken": "ExponentPushToken[...]",
  "platform": "android|ios"
}
```

### `NotificationResponse`

- `id`
- `type`
- `title`
- `body`
- `data`
- `sentAt`
- `readAt`
- `createdAt`

### `NotificationPreferenceResponse`

- `userId`
- `notificationsEnabled`

### `MarkAllNotificationsReadResponse`

- `markedCount`

### `PushTokenResponse`

- `id`
- `expoToken`
- `platform`
- `createdAt`
- `lastSeen`

## 7.7 Review DTOs

### `CreateReviewRequest`

```json
{
  "rating": 5,
  "comment": "string?"
}
```

Regras:

- cliente -> profissional: comentário obrigatório
- profissional -> cliente: comentário proibido

### `ReviewResponse`

- `id`
- `orderId`
- `reviewerId`
- `revieweeId`
- `rating`
- `comment`
- `submittedAt`
- `publishedAt`

## 7.8 Dispute DTOs

### `OpenDisputeRequest`

```json
{
  "reason": "string"
}
```

### `ResolveDisputeRequest`

```json
{
  "resolution": "refund_full|refund_partial|release_to_pro",
  "clientRefundAmount": 75.00,
  "professionalAmount": 25.00,
  "adminNotes": "string"
}
```

Regra:

- em `refund_partial`, `clientRefundAmount + professionalAmount` deve ser exatamente igual ao total do pedido

### `DisputeResponse`

- `id`
- `orderId`
- `openedBy`
- `reason`
- `status`
- `resolution`
- `clientRefundAmount`
- `professionalAmount`
- `resolvedBy`
- `resolvedAt`
- `openedAt`
- `adminNotes`

### `AddTextEvidenceRequest`

```json
{
  "content": "string"
}
```

### `DisputeEvidenceResponse`

- `id`
- `disputeId`
- `senderId`
- `evidenceType`
- `content`
- `file: StorageRefResponse|null`
- `sentAt`

## 8. Enums que o frontend precisa conhecer

### Roles

- `client`
- `professional`
- `admin`

### Professional

- `VerificationStatus`: `pending`, `approved`, `rejected`

### Documents

- `DocType`: `rg`, `cnh`, `proof_of_address`, `profile_photo`

### Offerings

- `PricingType`: `hourly`, `fixed`

### Calendar

- `BlockType`: `recurring`, `specific_date`, `order`

### Orders

- `OrderMode`: `express`, `on_demand`
- `OrderStatus`: `pending`, `accepted`, `completed_by_pro`, `completed`, `cancelled`, `disputed`
- `ProResponse`: `accepted`, `rejected`, `timeout`
- `ClientResponse`: `accepted`, `rejected`
- `PhotoType`: `request`, `completion_proof`

### Chat

- `MessageType`: `text`, `image`, `system`

### Notifications

- `NotificationType`:
  - `new_request`
  - `request_accepted`
  - `request_rejected`
  - `request_status_update`
  - `new_message`
  - `payment_released`
  - `dispute_opened`
  - `dispute_resolved`
  - `verification_result`
- `Platform`: `android`, `ios`

### Disputes

- `DisputeStatus`: `open`, `under_review`, `resolved`
- `DisputeResolution`: `refund_full`, `refund_partial`, `release_to_pro`
- `EvidenceType`: `text`, `photo`

## 9. Regras importantes para o frontend

### Sessão

- access token expira rápido
- usar refresh token para renovação
- logout remove refresh do Redis
- reset de senha invalida sessões ativas

### Conta em exclusão

Se o usuário estiver no período de exclusão, o login retorna `423`.  
O erro vem com campo `scheduledDeletionAt`.

### Express depende de endereço com coordenadas

Sem `lat` e `lng` no endereço, não dá para abrir pedido Express.

### Conversa só existe após proposta aceita

O frontend não deve esperar chat disponível antes de o cliente escolher o profissional.

### Avaliações públicas podem demorar

Uma review pode existir mas ainda não estar publicada.

### URLs de arquivo privado expiram

Se o frontend armazenar `downloadUrl`, precisa considerar que ela pode expirar.

### Falta de módulo real de pagamento

O frontend pode mostrar valores do pedido, mas hoje o backend ainda não executa cobrança/liberação real.

## 10. Pontos de atenção do estado atual

- O modo `on_demand` existe no enum, mas não há fluxo exposto por controller.
- O módulo de pagamento/escrow ainda está incompleto.
- Há vários `TODOs` de autorização em módulos fora de pedidos/chat/disputa/review.
- O chat já funciona com REST + STOMP.
- Push notification já tem persistência e registro de token, mas o dispatcher real pode depender da infraestrutura ativa.

## 11. Resumo final do funcionamento

Hoje a aplicação funciona assim:

- usuário cria conta
- se for profissional, cria perfil profissional, envia documentos, configura geo e serviços
- cliente cadastra endereço
- cliente abre pedido Express
- profissionais próximos recebem notificação e respondem
- cliente escolhe proposta
- pedido vira aceito e abre chat
- profissional conclui com foto
- cliente confirma
- ambos podem avaliar
- se houver problema, cliente abre disputa e admin resolve

Esse é o fluxo principal real implementado no backend atual.
