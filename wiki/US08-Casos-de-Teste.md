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

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US08.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST

**Resultado esperado**

Marcar paciente como inativo e impedir novo uso em triagem e agendamento.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para pacientes
- Quando solicita a exclusao de um paciente
- Entao o sistema deve inativar o paciente e impedir seu uso em novas triagens e novos agendamentos

### CT02 - Rejeitar operacao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US08.

**Cenario resumido**

- Perfil solicitante: Outro

**Resultado esperado**

Rejeitar operacao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta excluir um paciente
- Entao o sistema deve rejeitar a operacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como excluir ou inativar um paciente deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
