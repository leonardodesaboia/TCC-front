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

## Testar no celular com Expo Go e API na nuvem

Na pasta deste repositório, use Node.js compatível com Expo SDK 54 (20.19 ou superior), atualize a `main` e instale pelo lockfile:

```powershell
git switch main
git pull --ff-only origin main
npm ci
npm run start:cloud -- --go --clear
```

Mantenha o computador e o celular na mesma rede Wi-Fi. Abra o QR code no Expo Go (no iPhone, também pode usar a câmera). O computador fornece o JavaScript pelo Metro; o celular acessa o backend HTTPS diretamente pela internet. Não é necessário subir backend, PostgreSQL ou Docker no computador para esse teste. O comando `start:cloud` define a API correta e desativa mocks/bypass mesmo se existir `.env` antigo. Não troque a origem da API por `localhost`, pois no celular ele identifica o próprio aparelho.

O Expo Go precisa ser compatível com **SDK 54**, a versão deste projeto. Consulte [o guia oficial de compatibilidade](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/) e [o instalador por SDK/plataforma](https://expo.dev/go). Caso a rede bloqueie a conexão com o Metro, encerre o servidor e use `npm run start:cloud -- --go --tunnel --clear`. O túnel muda o transporte do bundle, mantendo a API na nuvem.

Para execução em pastas sincronizadas pelo OneDrive, prefira clonar em uma pasta local, por exemplo `C:\Projetos\TCC-front`. Após atualizar dependências, execute novamente `npm ci` e reinicie o Metro. Não compartilhe `node_modules` nem arquivos `.env` privados entre integrantes.

GPS e câmera dependem das permissões do aparelho e precisam de teste físico. Push remoto exige uma build de desenvolvimento com configuração EAS própria; não faz parte da validação no Expo Go. A verificação de 23/10/2026 inclui Expo Doctor, testes, TypeScript e geração dos bundles Android/iOS, além do reteste da API hospedada, sem substituir sessões reais nos aparelhos da equipe.

## Sprint de geolocalização

O cadastro distingue sugestão aproximada de ponto confirmado. GPS ou toque no mapa confirmam o local; mudar o endereço exige nova confirmação. A edição preserva a confiança do ponto salvo, e respostas atrasadas do geocoder não sobrescrevem uma escolha mais recente.

## Rodar junto com o backend

Para desenvolvimento com backend local, use a `main` atualizada nos dois repositórios, com Docker Desktop ativo e `.env` do backend preenchido conforme `.env.example`. Para testar com a API na nuvem, siga as instruções acima.

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
