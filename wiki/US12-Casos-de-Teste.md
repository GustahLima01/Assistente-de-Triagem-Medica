# US12 - Excluir ou inativar um sintoma

## Referencias

- [Epico 3 - Gerenciamento de Sintomas](Epico-3-Gerenciamento-de-Sintomas)

## Visao geral

Esta user story valida excluir ou inativar um sintoma com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Marcar sintoma como inativo e impedir uso em consulta de especialidade e triagem

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a exclusao de um sintoma
- Entao o sistema deve inativar o sintoma e impedir seu uso em consulta de especialidade e triagem

### CT02 - Rejeitar operacao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta excluir um sintoma
- Entao o sistema deve rejeitar a operacao
