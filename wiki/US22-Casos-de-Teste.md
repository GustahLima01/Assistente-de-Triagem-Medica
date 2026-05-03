# US22 - Selecionar um medico compativel com a especialidade sugerida

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epicos-e-User-Stories#epico-6---agendamento-de-consulta-medica)

## Visao geral

Esta user story valida selecionar um medico compativel com a especialidade sugerida com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir selecao sem validar aderencia por triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US22.

**Cenario resumido**

- triageId: Ausente

**Resultado esperado**

Permitir selecao sem validar aderencia por triagem.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o agendamento nao informa triageId
- Quando um medico e selecionado
- Entao o sistema deve permitir a selecao sem validar aderencia pela triagem

### CT02 - Permitir selecao do medico

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US22.

**Cenario resumido**

- triageId: Informado do mesmo paciente
- Especialidade do medico x triagem: Igual

**Resultado esperado**

Permitir selecao do medico.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o agendamento informa triageId do mesmo paciente
- Quando a especialidade sugerida na triagem coincide com a do medico
- Entao o sistema deve permitir a selecao

### CT03 - Rejeitar por triagem pertencer a outro paciente

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US22.

**Cenario resumido**

- triageId: Informado de outro paciente
- Especialidade do medico x triagem: Igual

**Resultado esperado**

Rejeitar por triagem pertencer a outro paciente.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o agendamento informa triageId de outro paciente
- Quando o medico e selecionado
- Entao o sistema deve rejeitar a operacao

### CT04 - Rejeitar por especialidade divergente da triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US22.

**Cenario resumido**

- triageId: Informado do mesmo paciente
- Especialidade do medico x triagem: Diferente

**Resultado esperado**

Rejeitar por especialidade divergente da triagem.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o agendamento informa triageId do mesmo paciente
- Quando a especialidade do medico diverge da especialidade sugerida na triagem
- Entao o sistema deve rejeitar a operacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como selecionar um medico compativel com a especialidade sugerida deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
