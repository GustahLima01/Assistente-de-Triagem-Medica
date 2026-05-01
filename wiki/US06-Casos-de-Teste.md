# US06 - Listar e consultar pacientes cadastrados

## Referencias

- [Epico 2 - Gerenciamento de Pacientes](Epico-2-Gerenciamento-de-Pacientes)

## Visao geral

Esta user story valida listar e consultar pacientes cadastrados com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir consulta de pacientes

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando solicita a listagem ou consulta de pacientes
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando solicita a listagem ou consulta de pacientes
- Entao o sistema deve rejeitar a operacao

### CT03 - Aplicar filtros na consulta de pacientes

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando consulta pacientes com filtro valido
- Entao o sistema deve retornar apenas os pacientes compativeis com o filtro aplicado

### CT04 - Retornar nao encontrado ao consultar paciente inexistente por identificador

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando consulta um paciente por identificador inexistente
- Entao o sistema deve retornar nao encontrado
