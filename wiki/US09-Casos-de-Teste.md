# US09 - Cadastrar sintomas

## Referencias

- [Epico 3 - Gerenciamento de Sintomas](Epico-3-Gerenciamento-de-Sintomas)

## Visao geral

Esta user story valida cadastrar sintomas com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Criar sintoma

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa name, severity valida e specialty preenchida
- Entao o sistema deve criar o sintoma

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta cadastrar um sintoma
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por obrigatoriedade

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando envia o cadastro sem todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar por severidade invalida

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa severidade fora de LOW, MEDIUM, HIGH ou CRITICAL
- Entao o sistema deve rejeitar a criacao

### CT05 - Rejeitar por falta de especialidade

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando nao associa o sintoma a uma especialidade
- Entao o sistema deve rejeitar a criacao
