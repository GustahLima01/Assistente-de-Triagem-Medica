# US15 - Editar um medico

## Referencias

- [Epico 4 - Gerenciamento de Medicos](Epico-4-Gerenciamento-de-Medicos)

## Visao geral

Esta user story valida editar um medico com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar medico

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando atualiza um medico mantendo CRM unico
- Entao o sistema deve salvar a alteracao

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta editar um medico
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por CRM duplicado

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa CRM ja utilizado por outro medico
- Entao o sistema deve rejeitar a atualizacao
