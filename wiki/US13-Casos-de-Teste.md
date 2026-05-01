# US13 - Cadastrar um medico

## Referencias

- [Epico 4 - Gerenciamento de Medicos](Epico-4-Gerenciamento-de-Medicos)

## Visao geral

Esta user story valida cadastrar um medico com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Criar medico

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa name, crm e specialty com CRM unico
- Entao o sistema deve criar o medico

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta cadastrar um medico
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por obrigatoriedade

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando envia cadastro sem todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar por CRM duplicado

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa CRM ja existente no sistema
- Entao o sistema deve rejeitar a criacao
