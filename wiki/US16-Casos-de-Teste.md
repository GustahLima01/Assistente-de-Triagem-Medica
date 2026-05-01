# US16 - Excluir ou inativar um medico

## Referencias

- [Epico 4 - Gerenciamento de Medicos](Epico-4-Gerenciamento-de-Medicos)

## Visao geral

Esta user story valida excluir ou inativar um medico com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Marcar medico como inativo e impedir novo agendamento

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a exclusao de um medico
- Entao o sistema deve inativar o medico e impedir novos agendamentos para ele

### CT02 - Rejeitar operacao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta excluir um medico
- Entao o sistema deve rejeitar a operacao
