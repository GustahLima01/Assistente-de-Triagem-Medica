# US23 - Validar conflito de horarios no agendamento

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epicos-e-User-Stories#epico-6---agendamento-de-consulta-medica)

## Visao geral

Esta user story valida validar conflito de horarios no agendamento com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir criacao sem conflito

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US23.

**Cenario resumido**

- scheduledAt: Normalizavel para ISO
- Agendamento existente para mesmo medico e horario: Nenhum SCHEDULED

**Resultado esperado**

Permitir criacao sem conflito.

**Leitura de negocio**

Este caso protege a operacao contra colisao de agenda e contribui para a confiabilidade do atendimento.

**Cenario em Gherkin**

- Dado que a data e hora informadas podem ser normalizadas para ISO
- Quando nao existe outro agendamento com status SCHEDULED para o mesmo medico no mesmo horario
- Entao o sistema deve permitir a criacao

### CT02 - Rejeitar por conflito de horario

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US23.

**Cenario resumido**

- scheduledAt: Normalizavel para ISO
- Agendamento existente para mesmo medico e horario: Existe SCHEDULED

**Resultado esperado**

Rejeitar por conflito de horario.

**Leitura de negocio**

Este caso protege a operacao contra colisao de agenda e contribui para a confiabilidade do atendimento.

**Cenario em Gherkin**

- Dado que a data e hora informadas podem ser normalizadas para ISO
- Quando ja existe agendamento SCHEDULED para o mesmo medico no mesmo horario
- Entao o sistema deve rejeitar a criacao por conflito

### CT03 - Rejeitar por data invalida

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US23.

**Cenario resumido**

- scheduledAt: Nao normalizavel

**Resultado esperado**

Rejeitar por data invalida.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que a data e hora informadas nao podem ser normalizadas para ISO
- Quando o agendamento e submetido
- Entao o sistema deve rejeitar a criacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como validar conflito de horarios no agendamento deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
