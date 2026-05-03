# Contexto

## Visao do produto

O Assistente de Triagem Medica e uma aplicacao voltada para apoiar o fluxo inicial de atendimento de uma clinica, ajudando a registrar pacientes, consolidar sintomas informados, sugerir a especialidade medica mais adequada e permitir o agendamento da consulta.

O produto nao tem como objetivo realizar diagnostico medico. Seu papel e apoiar a triagem operacional e o encaminhamento inicial com base em regras de negocio predefinidas.

## Objetivo inicial

Construir uma API REST com armazenamento em banco de dados em memoria para validar o fluxo principal da aplicacao e acelerar o desenvolvimento do MVP.

## Fluxo principal do MVP

1. Um usuario autenticado da clinica acessa o sistema.
2. O usuario cadastra ou localiza um paciente.
3. O usuario registra os sintomas informados.
4. O sistema sugere a especialidade medica com base nos sintomas cadastrados.
5. O usuario agenda uma consulta com um medico compativel com a especialidade sugerida.
6. O usuario consulta a agenda e pode editar, reagendar ou cancelar o agendamento quando necessario.

## Perfis considerados

- Administrador da clinica
- Atendente ou recepcionista
- Medico

## Escopo funcional inicial

- Cadastro, edicao e exclusao de usuarios da clinica
- Login de usuarios da clinica
- Cadastro, edicao e exclusao de pacientes
- Cadastro, edicao e exclusao de medicos
- Cadastro, edicao e exclusao de sintomas
- Consulta de especialidade medica com base nos sintomas informados
- Agendamento, consulta, reagendamento e cancelamento de consulta medica

## Direcionadores do produto

- Apoiar a triagem operacional sem caracterizar diagnostico medico
- Priorizar fluxo de atendimento antes de expansoes administrativas
- Garantir coerencia entre permissao, triagem e agendamento
- Garantir manutencao do ciclo de vida do agendamento sem perder historico
- Manter historico minimo para consulta e rastreabilidade

## Riscos e cuidados

- O sistema nao deve ser comunicado como ferramenta de diagnostico
- Exclusao fisica pode comprometer historico e rastreabilidade
- Banco em memoria atende ao MVP, mas nao a um ambiente produtivo
- Dados sensiveis exigem cuidado com autenticacao, autorizacao e auditoria
