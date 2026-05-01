# US20 - Registrar o resultado consolidado da triagem

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida registrar o resultado consolidado da triagem com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Persistir resultado consolidado da triagem

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando conclui o registro de triagem com especialidade sugerida, prioridade, sintomas considerados e usuario responsavel
- Entao o sistema deve persistir o resultado consolidado

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta registrar o resultado consolidado da triagem
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar gravacao do resultado consolidado sem dados essenciais da triagem

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando tenta registrar o resultado consolidado sem especialidade sugerida, prioridade, sintomas considerados ou usuario responsavel
- Entao o sistema deve rejeitar a gravacao
