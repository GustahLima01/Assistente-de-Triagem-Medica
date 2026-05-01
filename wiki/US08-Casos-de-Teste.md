# US08 - Excluir ou inativar um paciente

## Referencias

- [Epico 2 - Gerenciamento de Pacientes](Epico-2-Gerenciamento-de-Pacientes)

## Visao geral

Esta user story valida excluir ou inativar um paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Marcar paciente como inativo e impedir novo uso em triagem e agendamento

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para pacientes
- Quando solicita a exclusao de um paciente
- Entao o sistema deve inativar o paciente e impedir seu uso em novas triagens e novos agendamentos

### CT02 - Rejeitar operacao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta excluir um paciente
- Entao o sistema deve rejeitar a operacao
