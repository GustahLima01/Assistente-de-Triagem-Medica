# US05 - Cadastrar um paciente

## Referencias

- [Epico 2 - Gerenciamento de Pacientes](Epico-2-Gerenciamento-de-Pacientes)

## Visao geral

Esta user story valida cadastrar um paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Criar paciente convertendo opcionais vazios para null

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para pacientes
- Quando informa campos obrigatorios completos, birthDate valida, documento unico e opcionais vazios
- Entao o sistema deve criar o paciente convertendo campos opcionais vazios para null

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN nem RECEPTIONIST
- Quando tenta cadastrar um paciente
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por obrigatoriedade

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando envia cadastro sem todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar por data invalida

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa birthDate invalida
- Entao o sistema deve rejeitar a criacao

### CT05 - Rejeitar por documento duplicado

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa documento ja existente no sistema
- Entao o sistema deve rejeitar a criacao
