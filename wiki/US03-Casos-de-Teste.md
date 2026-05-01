# US03 - Editar um usuario da clinica

## Referencias

- [Epico 1 - Gerenciamento de Usuarios da Clinica](Epico-1-Gerenciamento-de-Usuarios-da-Clinica)

## Visao geral

Esta user story valida editar um usuario da clinica com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar dados com email normalizado e senha em hash se alterada

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando atualiza um usuario com role permitido e email unico
- Entao o sistema deve salvar os dados com email normalizado e senha em hash se houver alteracao

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta editar um usuario
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por role invalido

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa um role nao permitido na edicao
- Entao o sistema deve rejeitar a atualizacao

### CT04 - Rejeitar por email duplicado

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa um email ja utilizado por outro usuario
- Entao o sistema deve rejeitar a atualizacao
