# US26 - Cancelar uma consulta

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epicos-e-User-Stories#epico-6---agendamento-de-consulta-medica)

## Visao geral

Esta user story valida cancelar uma consulta com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Cancelar agendamento SCHEDULED com sucesso

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US26.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: SCHEDULED
- Consulta posterior do registro: Sim

**Resultado esperado**

Cancelar logicamente o agendamento e manter seu historico consultavel.

**Leitura de negocio**

Este caso representa o encerramento controlado do agendamento sem perda de historico.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando cancela um agendamento com status SCHEDULED
- Entao o sistema deve alterar seu status para CANCELLED e manter o historico consultavel

### CT02 - Rejeitar cancelamento por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US26.

**Cenario resumido**

- Perfil solicitante: Outro
- Status atual do agendamento: SCHEDULED
- Consulta posterior do registro: Nao aplicavel

**Resultado esperado**

Rejeitar a operacao por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso sobre o cancelamento da agenda.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta cancelar um agendamento
- Entao o sistema deve rejeitar a operacao

### CT03 - Retornar nao encontrado ao cancelar agendamento inexistente

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US26.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: Nao encontrado
- Consulta posterior do registro: Nao aplicavel

**Resultado esperado**

Retornar nao encontrado para o agendamento informado.

**Leitura de negocio**

Este caso evita operacoes sobre registros inexistentes e melhora a confiabilidade do fluxo.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando tenta cancelar um agendamento inexistente
- Entao o sistema deve retornar nao encontrado

### CT04 - Rejeitar cancelamento de agendamento ja cancelado

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US26.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: CANCELLED
- Consulta posterior do registro: Nao aplicavel

**Resultado esperado**

Rejeitar a operacao por cancelamento duplicado.

**Leitura de negocio**

Este caso impede transicoes redundantes e preserva a consistencia do ciclo de vida do agendamento.

**Cenario em Gherkin**

- Dado que o agendamento ja possui status CANCELLED
- Quando o solicitante tenta cancela-lo novamente
- Entao o sistema deve rejeitar a operacao

### CT05 - Permitir novo agendamento no mesmo horario apos cancelamento

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct05 para a US26.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: CANCELLED seguido de novo agendamento
- Consulta posterior do registro: Sim

**Resultado esperado**

Permitir nova criacao no mesmo medico e horario sem conflito.

**Leitura de negocio**

Este caso garante que o cancelamento realmente devolva disponibilidade a agenda.

**Cenario em Gherkin**

- Dado que um agendamento do medico foi cancelado
- Quando um novo agendamento e solicitado para o mesmo medico e horario
- Entao o sistema deve permitir a nova criacao sem conflito

### CT06 - Exibir agendamento cancelado com status traduzido

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct06 para a US26.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Status atual do agendamento: CANCELLED
- Consulta posterior do registro: Sim

**Resultado esperado**

Exibir o registro consultado com status Cancelada em PT-BR.

**Leitura de negocio**

Este caso conecta o cancelamento com a experiencia de consulta da agenda, deixando o status compreensivel para o usuario final.

**Cenario em Gherkin**

- Dado que existe um agendamento cancelado
- Quando ele e consultado na agenda
- Entao o sistema deve permanecer exibindo o registro com status Cancelada em PT-BR

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como cancelar uma consulta deve se comportar em cenarios de sucesso e de excecao.

- cobertura do encerramento logico do agendamento
- validacao das principais regras de negocio
- preservacao do historico e liberacao correta da agenda

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
