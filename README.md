# AllSet — frontend

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
