# US22 - Selecionar um medico compativel com a especialidade sugerida

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epico-6-Agendamento-de-Consulta-Medica)

## Visao geral

Esta user story valida selecionar um medico compativel com a especialidade sugerida com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir selecao sem validar aderencia por triagem

**Cenario em Gherkin**

- Dado que o agendamento nao informa triageId
- Quando um medico e selecionado
- Entao o sistema deve permitir a selecao sem validar aderencia pela triagem

### CT02 - Permitir selecao do medico

**Cenario em Gherkin**

- Dado que o agendamento informa triageId do mesmo paciente
- Quando a especialidade sugerida na triagem coincide com a do medico
- Entao o sistema deve permitir a selecao

### CT03 - Rejeitar por triagem pertencer a outro paciente

**Cenario em Gherkin**

- Dado que o agendamento informa triageId de outro paciente
- Quando o medico e selecionado
- Entao o sistema deve rejeitar a operacao

### CT04 - Rejeitar por especialidade divergente da triagem

**Cenario em Gherkin**

- Dado que o agendamento informa triageId do mesmo paciente
- Quando a especialidade do medico diverge da especialidade sugerida na triagem
- Entao o sistema deve rejeitar a operacao
