# US04 - Excluir ou inativar um usuario da clinica

## Referencias

- [Epico 1 - Gerenciamento de Usuarios da Clinica](Epico-1-Gerenciamento-de-Usuarios-da-Clinica)

## Visao geral

Esta user story valida excluir ou inativar um usuario da clinica com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Marcar usuario como inativo sem remocao fisica

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a exclusao de um usuario
- Entao o sistema deve realizar exclusao logica marcando o usuario como inativo

### CT02 - Rejeitar operacao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta excluir um usuario
- Entao o sistema deve rejeitar a operacao
