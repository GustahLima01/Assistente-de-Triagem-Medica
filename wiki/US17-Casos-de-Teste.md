# US17 - Registrar os sintomas informados por um paciente

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida registrar os sintomas informados por um paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Registrar triagem desconsiderando IDs duplicados antes do calculo

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando registra uma triagem para paciente ativo com symptomIds validos contendo duplicidades
- Entao o sistema deve desconsiderar IDs duplicados antes do calculo e registrar a triagem

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN nem RECEPTIONIST
- Quando tenta registrar uma triagem
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por paciente inativo

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando tenta registrar triagem para paciente inativo
- Entao o sistema deve rejeitar a operacao

### CT04 - Rejeitar por uso de sintoma inativo

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa ao menos um sintoma inativo na triagem
- Entao o sistema deve rejeitar a operacao

### CT05 - Rejeitar por falta de dados obrigatorios

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando nao informa patientId ou symptomIds em array nao vazio
- Entao o sistema deve rejeitar o registro
