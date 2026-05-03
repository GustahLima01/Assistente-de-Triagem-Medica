# US25 - Editar ou reagendar uma consulta

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epicos-e-User-Stories#epico-6---agendamento-de-consulta-medica)

## Visao geral

Esta user story valida editar ou reagendar uma consulta com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Editar observacoes de um agendamento SCHEDULED

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US25.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: SCHEDULED
- Campo alterado: notes
- Validade da nova composicao: Valida

**Resultado esperado**

Permitir a edicao das observacoes com rastreabilidade.

**Leitura de negocio**

Este caso cobre uma correcao operacional simples sem impacto na disponibilidade do medico.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando edita apenas as observacoes de um agendamento com status SCHEDULED
- Entao o sistema deve persistir a alteracao com rastreabilidade

### CT02 - Reagendar consulta para novo horario sem conflito

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US25.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: SCHEDULED
- Campo alterado: scheduledAt
- Validade da nova composicao: Valida

**Resultado esperado**

Permitir reagendamento com horario normalizado e sem conflito.

**Leitura de negocio**

Este caso representa o ajuste esperado da agenda quando o atendimento precisa ser remanejado.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando reagenda um agendamento SCHEDULED para novo horario valido e sem conflito
- Entao o sistema deve salvar o novo horario normalizado

### CT03 - Rejeitar reagendamento por conflito de horario

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US25.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: SCHEDULED
- Campo alterado: scheduledAt
- Validade da nova composicao: Em conflito

**Resultado esperado**

Rejeitar a alteracao por conflito de horario.

**Leitura de negocio**

Este caso protege a agenda medica contra sobreposicao indevida apos a criacao inicial.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando tenta reagendar um agendamento SCHEDULED para horario ja ocupado pelo mesmo medico
- Entao o sistema deve rejeitar a alteracao por conflito

### CT04 - Rejeitar troca para medico incompativel com a triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US25.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: SCHEDULED
- Campo alterado: doctorId
- Validade da nova composicao: Incompativel com triagem

**Resultado esperado**

Rejeitar a alteracao por incompatibilidade com a triagem.

**Leitura de negocio**

Este caso preserva a aderencia clinica entre o encaminhamento da triagem e o medico selecionado.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando altera o medico de um agendamento com triagem vinculada para especialidade divergente
- Entao o sistema deve rejeitar a alteracao

### CT05 - Rejeitar edicao de agendamento cancelado

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct05 para a US25.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: CANCELLED
- Campo alterado: notes
- Validade da nova composicao: Nao aplicavel

**Resultado esperado**

Rejeitar a edicao do agendamento cancelado.

**Leitura de negocio**

Este caso evita reabrir implicitamente um agendamento cujo ciclo ja foi encerrado por cancelamento.

**Cenario em Gherkin**

- Dado que o agendamento possui status CANCELLED
- Quando o solicitante tenta editar seus dados
- Entao o sistema deve rejeitar a edicao

### CT07 - Retornar nao encontrado ao editar agendamento inexistente

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct07 para a US25.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: Nao encontrado
- Campo alterado: notes
- Validade da nova composicao: Nao aplicavel

**Resultado esperado**

Retornar nao encontrado para o agendamento informado.

**Leitura de negocio**

Este caso reduz erro operacional e aumenta a confiabilidade da manutencao da agenda.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando tenta editar um agendamento inexistente
- Entao o sistema deve retornar nao encontrado

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como editar ou reagendar uma consulta deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo de manutencao da agenda
- validacao das principais regras de negocio
- preservacao da rastreabilidade e da coerencia com a triagem

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
