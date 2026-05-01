# Assistente de Triagem Medica

> API REST para apoiar o fluxo inicial de triagem de uma clinica, organizando cadastro, triagem e encaminhamento com mais consistencia operacional.

## Visao Geral

O Assistente de Triagem Medica foi concebido para apoiar o atendimento inicial de uma clinica sem substituir avaliacao medica. O foco do produto e registrar pacientes, consolidar sintomas, sugerir a especialidade mais adequada e permitir o agendamento da consulta com rastreabilidade do processo.

## Jornada Principal

1. Um usuario autenticado acessa o sistema.
2. O paciente e localizado ou cadastrado.
3. Os sintomas informados sao registrados.
4. O sistema calcula a especialidade sugerida e a prioridade da triagem.
5. A consulta e agendada com um medico compativel.

## Portfolio do Produto

| Frente | Objetivo | Valor entregue |
|---|---|---|
| Acesso e seguranca | Controlar autenticacao e permissao por perfil | Garante uso seguro e coerente do sistema |
| Cadastro operacional | Manter usuarios, pacientes, medicos e sintomas | Sustenta o fluxo da triagem com dados confiaveis |
| Triagem assistida | Sugerir especialidade e prioridade com base nos sintomas | Apoia o encaminhamento inicial |
| Agendamento | Conectar triagem e disponibilidade medica | Da continuidade ao atendimento |

## Mapa da Wiki

- [Requisitos](Requisitos)
  - [Requisitos Funcionais](Requisitos-Funcionais)
  - [Requisitos Nao Funcionais](Requisitos-Nao-Funcionais)
- [Epicos e User Stories](Epicos-e-User-Stories)
- [Casos de Teste](Casos-de-Teste)
  - [Epico 1: Gerenciamento de Usuarios da Clinica](Casos-de-Teste)
    - [US01 - Cadastrar um usuario da clinica](US01-Casos-de-Teste)
    - [US02 - Fazer login no sistema](US02-Casos-de-Teste)
    - [US03 - Editar um usuario da clinica](US03-Casos-de-Teste)
    - [US04 - Excluir ou inativar um usuario da clinica](US04-Casos-de-Teste)
  - [Epico 2: Gerenciamento de Pacientes](Casos-de-Teste)
    - [US05 - Cadastrar um paciente](US05-Casos-de-Teste)
    - [US06 - Listar e consultar pacientes cadastrados](US06-Casos-de-Teste)
    - [US07 - Editar um paciente](US07-Casos-de-Teste)
    - [US08 - Excluir ou inativar um paciente](US08-Casos-de-Teste)
  - [Epico 3: Gerenciamento de Sintomas](Casos-de-Teste)
    - [US09 - Cadastrar sintomas](US09-Casos-de-Teste)
    - [US10 - Listar e consultar sintomas cadastrados](US10-Casos-de-Teste)
    - [US11 - Editar um sintoma](US11-Casos-de-Teste)
    - [US12 - Excluir ou inativar um sintoma](US12-Casos-de-Teste)
  - [Epico 4: Gerenciamento de Medicos](Casos-de-Teste)
    - [US13 - Cadastrar um medico](US13-Casos-de-Teste)
    - [US14 - Listar e consultar medicos cadastrados](US14-Casos-de-Teste)
    - [US15 - Editar um medico](US15-Casos-de-Teste)
    - [US16 - Excluir ou inativar um medico](US16-Casos-de-Teste)
  - [Epico 5: Triagem e Sugestao de Especialidade](Casos-de-Teste)
    - [US17 - Registrar os sintomas informados por um paciente](US17-Casos-de-Teste)
    - [US18 - Consultar a especialidade sugerida](US18-Casos-de-Teste)
    - [US19 - Visualizar a prioridade calculada da triagem](US19-Casos-de-Teste)
    - [US20 - Registrar o resultado consolidado da triagem](US20-Casos-de-Teste)
  - [Epico 6: Agendamento de Consulta Medica](Casos-de-Teste)
    - [US21 - Agendar uma consulta para o paciente](US21-Casos-de-Teste)
    - [US22 - Selecionar um medico compativel com a especialidade sugerida](US22-Casos-de-Teste)
    - [US23 - Validar conflito de horarios no agendamento](US23-Casos-de-Teste)
    - [US24 - Consultar os agendamentos realizados](US24-Casos-de-Teste)
## Objetivo da Wiki

Organizar a visao do produto, o fluxo principal e o backlog priorizado para a construcao evolutiva do MVP.
