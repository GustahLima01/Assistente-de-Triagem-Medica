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

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa name, email, password e role permitido com email unico
- Entao o sistema deve criar o usuario com email normalizado e senha persistida em hash

### CT02 - Rejeitar cadastro quando o solicitante nao e ADMIN

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta cadastrar um usuario da clinica
- Entao o sistema deve rejeitar a operacao por autorizacao

### CT03 - Rejeitar cadastro com campos obrigatorios incompletos

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando envia o cadastro sem todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar cadastro com role fora do dominio permitido

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa um role fora de ADMIN, RECEPTIONIST ou DOCTOR
- Entao o sistema deve rejeitar a criacao

### CT05 - Rejeitar cadastro com email ja existente

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa email que ja existe no sistema
- Entao o sistema deve rejeitar a criacao
