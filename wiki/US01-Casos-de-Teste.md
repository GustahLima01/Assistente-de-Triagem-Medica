# US01 - Cadastrar um usuario da clinica

## Referencias

- [Epico 1 - Gerenciamento de Usuarios da Clinica](Epico-1-Gerenciamento-de-Usuarios-da-Clinica)

## Visao geral

Esta user story valida o controle de cadastro de usuarios da clinica com foco em seguranca, permissao de acesso e integridade dos dados.
O objetivo dos testes e garantir que:

- apenas administradores possam cadastrar novos usuarios
- os campos obrigatorios e o dominio de perfis sejam respeitados
- e-mails duplicados sejam bloqueados
- o cadastro preserve boas praticas de seguranca, como normalizacao do e-mail e armazenamento protegido da senha

## Casos de teste

### CT01 - Criar usuario com perfil permitido e email unico

**Objetivo**

Comprovar que um administrador consegue cadastrar um novo usuario quando todas as regras obrigatorias sao atendidas.

**Cenario resumido**

- Perfil solicitante: `ADMIN`
- Campos obrigatorios: completos
- Role informado: permitido
- Email: unico

**Resultado esperado**

O sistema deve criar o usuario com e-mail normalizado e senha armazenada em hash.

**Leitura de negocio**

Este caso representa o fluxo principal esperado do produto para liberar novos acessos com seguranca e consistencia.

### CT02 - Rejeitar cadastro quando o solicitante nao e ADMIN

**Objetivo**

Validar que o gerenciamento de usuarios e restrito ao perfil correto.

**Cenario resumido**

- Perfil solicitante: nao `ADMIN`
- Campos obrigatorios: completos
- Role informado: permitido
- Email: unico

**Resultado esperado**

O sistema deve rejeitar a operacao por falta de permissao.

**Leitura de negocio**

Este caso reforca a separacao de responsabilidades e evita que perfis indevidos criem acessos administrativos ou operacionais.

### CT03 - Rejeitar cadastro com campos obrigatorios incompletos

**Objetivo**

Garantir que a API nao aceite criacao de usuario com dados essenciais ausentes.

**Cenario resumido**

- Perfil solicitante: `ADMIN`
- Campos obrigatorios: incompletos
- Role informado: permitido
- Email: unico

**Resultado esperado**

O sistema deve rejeitar a criacao por falha de obrigatoriedade.

**Leitura de negocio**

Este caso protege a qualidade cadastral e reduz falhas operacionais decorrentes de registros incompletos.

### CT04 - Rejeitar cadastro com role fora do dominio permitido

**Objetivo**

Confirmar que apenas os perfis previstos pelo sistema podem ser utilizados no cadastro de usuarios.

**Cenario resumido**

- Perfil solicitante: `ADMIN`
- Campos obrigatorios: completos
- Role informado: nao permitido
- Email: unico

**Resultado esperado**

O sistema deve rejeitar a criacao por perfil invalido.

**Leitura de negocio**

Este caso garante previsibilidade do modelo de autorizacao e evita a criacao de perfis arbitrarios fora das regras da aplicacao.

### CT05 - Rejeitar cadastro com email ja existente

**Objetivo**

Assegurar que o identificador de acesso do usuario seja unico na base.

**Cenario resumido**

- Perfil solicitante: `ADMIN`
- Campos obrigatorios: completos
- Role informado: permitido
- Email: duplicado

**Resultado esperado**

O sistema deve rejeitar a criacao por duplicidade de e-mail.

**Leitura de negocio**

Este caso evita ambiguidade de login, reduz risco de conflitos de identidade e melhora a governanca de acessos.

## Resumo executivo

Os casos da US01 demonstram que o cadastro de usuarios segue tres pilares principais:

- autorizacao correta para quem pode executar a acao
- validacao consistente dos dados informados
- seguranca na criacao da conta e no controle de identidade

Esse conjunto oferece uma leitura objetiva de que o fluxo de onboarding de usuarios esta preparado para um contexto clinico com controle minimo de acesso.
