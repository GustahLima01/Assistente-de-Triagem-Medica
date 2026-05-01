# US19 - Visualizar a prioridade calculada da triagem

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida visualizar a prioridade calculada da triagem com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Retornar a maior severidade entre os sintomas informados

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando consulta a prioridade calculada a partir de sintomas validos
- Entao o sistema deve retornar a maior severidade entre os sintomas informados

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando consulta a prioridade da triagem
- Entao o sistema deve rejeitar a operacao

### CT03 - Especificacao em aberto para comportamento

**Cenario em Gherkin**

- Dado que nao ha sintomas disponiveis para calcular prioridade
- Quando a consulta e realizada
- Entao o sistema deve rejeitar a operacao
