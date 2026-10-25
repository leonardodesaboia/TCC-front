# Correções de usabilidade e acessibilidade — 24/10/2026

Base: `develop` em `0fb76cc`. Branch de trabalho: `codex/ux-accessibility`.
Compatível com a API hospedada atual; não altera contratos ou regras do backend.

## Comportamento corrigido

| Ponto | Resultado |
| --- | --- |
| Express aguardando indefinidamente | Permissão limitada a 30 segundos e leitura de GPS a 20 segundos. Falhas saem do carregamento e permitem nova tentativa. Há cancelamento durante a ativação. |
| Respostas atrasadas da localização | Posições/permissões antigas não reativam uma tentativa cancelada. Inscrições iniciadas tardiamente são removidas. Reativar aguarda a desativação anterior. |
| Permissão recusada | Orientação específica para celular ou navegador. Na web, “Ver permissões” explica as permissões do site, sem tentar abrir configurações nativas. |
| Raio do Express | Removida a promessa fixa de 5 km; o alcance depende da área de busca configurada pelo servidor. |
| Duração | Cadastro, edição e proposta de troca usam horas e minutos. A API continua recebendo minutos inteiros. Minutos fora de 0–59, decimais e números parciais não são truncados silenciosamente. |
| Cobrança | Preço opcional por hora continua permitido; um valor preenchido deve ser positivo. Trocar de cobrança por hora para valor fixo não mantém a opção de limpar o preço. |
| Senha | Exemplos de símbolos, requisitos com estados descritivos e melhor contraste; requisitos de segurança mantidos. |
| Cadastro profissional | A mensagem usa o estado consultado após os uploads. Conta aprovada não é descrita como pendente. Falha de upload preserva a conta e orienta completar os documentos. |
| Conversas semelhantes | Serviço/categoria, descrição, identificador do pedido, modalidade, situação, data e horário da última mensagem na lista. No chat, contexto do pedido e botão “Ver pedido”. |
| Navegação | Retorno do detalhe de pedido para Pedidos, inclusive pelo tratamento de Voltar no Android. Formulários abertos diretamente têm retorno à própria aba. Tocar na aba ativa também recupera a raiz quando a pilha só tem uma tela interna. |
| Foto de conclusão | Mantida a prévia antes do envio; explicação sobre foto do serviço finalizado, cancelamento, bloqueio de envio duplicado e recuperação de erro sem descartar a imagem selecionada. Upload usa o mesmo adaptador web/nativo dos demais formulários. |
| Controles acessíveis | Campos com nomes e erros associados; botões com nome preservado no carregamento; estados de seleção na web; menus, cartões e fotos com papel de botão; alvos maiores e altura flexível nos botões e campos. Eliminada a duplicação do switch Express na web. |
| Contraste | Ajustados tokens de laranja, texto secundário e cores semânticas; badges reutilizam as cores semânticas. Oito verificações cobrem combinações de texto compartilhadas sobre branco. |
| Inicialização | Incorporadas da `main` as proteções de execução fora do OneDrive e as versões compatíveis do Expo SDK 54, sem remover as mudanças recentes de imagem da `develop`. |

## Verificação

- `npm run typecheck`: passou.
- `npm test`: **100 testes passaram**, em 14 arquivos; 40 regressões adicionadas à base de 60.
- `node --test scripts/cloud-runtime.test.cjs`: **6 testes passaram**.
- `npx expo install --check`: dependências atualizadas para o SDK instalado.
- `npx expo export --platform all --output-dir dist-ux-accessibility`: bundles web, Android e iOS gerados.
- Interface web conectada à API real: login da conta de teste, duração com 3h30, bloqueio de 60 no campo Minutos, seleção acessível das opções, menus, permissão de localização recusada, orientação das permissões do navegador, distinção entre duas conversas do mesmo cliente, abertura do pedido associado e retorno à lista.
- A navegação de retorno de um formulário aberto diretamente também foi exercitada na interface.
- Nenhum serviço foi publicado pelo formulário usado nesta conferência. Foram consultados pedidos fictícios já concluídos/cancelados.

Os logs de falha de GPS na suíte são gerados intencionalmente pelos cenários de timeout e recusa. Os testes verificam a recuperação desses erros.

## Limites e conferências no aparelho

- GPS real, permissões nativas, TalkBack/VoiceOver, teclado do celular e fonte ampliada precisam de conferência em Android/iOS físico. Gerar bundles não equivale a esse teste.
- A confirmação final com foto não foi reenviada nesta conferência web: os pedidos próprios usados estavam encerrados. O adaptador e o fluxo foram revisados; o ensaio completo de upload/recuperação no aparelho continua recomendado.
- A lista de conversas mantém o limite de 50 da API atual. O contexto adicional usa até 100 pedidos recentes em uma busca compartilhada. Para pedidos fora dessa lista ou falha dessa busca, o identificador continua distinguindo a conversa e o chat consulta seu pedido individualmente.
- Não constitui auditoria integral de conformidade WCAG de todas as telas. As verificações cobrem os componentes e fluxos descritos acima.

Referência das propriedades de acessibilidade: [React Native 0.81 — Accessibility](https://reactnative.dev/docs/0.81/accessibility).

## Execução pela equipe

```powershell
npm run start:cloud -- --go --clear
```

Na pasta do OneDrive, o launcher sincroniza os fontes para uma cópia local de execução e instala conforme o lock. A edição e o Git continuam no checkout original. Para o Expo Go no celular, use a mesma rede; se a rede bloquear a conexão local, execute com `--tunnel`.
