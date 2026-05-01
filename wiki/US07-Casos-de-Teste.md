# US07 - Editar um paciente

## Referencias

- [Epico 2 - Gerenciamento de Pacientes](Epico-2-Gerenciamento-de-Pacientes)

## Visao geral

Esta user story valida editar um paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar paciente convertendo opcionais vazios para null

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para pacientes
- Quando atualiza o paciente com birthDate valida, documento unico e opcionais vazios
- Entao o sistema deve salvar a alteracao convertendo opcionais vazios para null

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta editar um paciente
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por data invalida

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa birthDate invalida na edicao
- Entao o sistema deve rejeitar a atualizacao

### CT04 - Rejeitar por documento duplicado

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa documento que ja pertence a outro paciente
- Entao o sistema deve rejeitar a atualizacao
