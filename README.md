# AllSet — frontend

## API hospedada e início rápido

O backend da equipe está em `https://allset-tcc-allset-compose.vn6tpb.easypanel.host`.
O `.env` local anterior usava `http://72.61.32.149:8080`; esse endereço não deve substituir a origem HTTPS atual.

```powershell
npm ci
npm run web:cloud
```

Abra http://localhost:8090. O comando define a API antes de carregar o Metro, habilita o proxy web já existente e mantém autenticação e dados reais (sem mocks). Para Expo Go/aparelho: `npm run start:cloud`; a versão nativa usa a origem HTTPS diretamente. GPS/câmera ainda precisam de validação em aparelho.

Para apontar para outra API, defina `ALLSET_API_URL` antes do comando. Se preferir `.env`, use `.env.example` como referência. Reinicie o Expo após alterar a origem. O proxy do Metro só existe no servidor de desenvolvimento; uma exportação web precisa de proxy de mesma origem ou de CORS corretamente configurado no backend.

Na pasta que contém os dois repositórios há `Iniciar-AllSet.ps1`, que usa uma cópia de execução fora do OneDrive para evitar problemas de sincronização de node_modules.

## Sprint de geolocalização

O cadastro distingue sugestão aproximada de ponto confirmado. GPS ou toque no mapa confirmam o local; mudar o endereço exige nova confirmação. A edição preserva a confiança do ponto salvo, e respostas atrasadas do geocoder não sobrescrevem uma escolha mais recente.

## Rodar junto com o backend

Use `fix/geolocation-sprint-validation` nos dois repositórios, com Docker Desktop ativo e `.env` do backend preenchido conforme `.env.example`.

No backend, com os repositórios lado a lado:

```powershell
.\scripts\start-local.ps1
```

Ou informe `-FrontendPath 'caminho/do/TCC-front'`. O script espera a API ficar saudável e então sobe o frontend em **http://localhost:8081**. O Nginx encaminha `/api/` e `/ws` ao backend local na porta 8080. Esta configuração Docker é para desenvolvimento local.

O backend pode ativar dados de demonstração com `SEED_ENABLED=true` (somente desenvolvimento).

## Verificações

```sh
npm ci
npm test
npm run typecheck
```

O build web é validado durante `docker compose build`. GPS foi coberto nos testes de lógica; a captura física em Android/iOS ainda requer teste em aparelho.
