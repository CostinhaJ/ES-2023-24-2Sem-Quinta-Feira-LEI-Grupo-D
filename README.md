# ESGestaoSalas

Projeto da cadeira de Engenharia de Software. Iremos implementar uma nova versão de funcionalidade de gestão de salas em Web.

=============================================================================================

# Autores
Grupo: Quinta-Feira-LEI-Grupo-D

Manuel Cunha | 104999 | mrffc-iscteiul
Edgar Costa | 69172 | emncosta
Rafael Pardal | 104741 | RafaelPardal
Leonardo Costa | 104949 | BOT1LEO
Tiago Varandas Martins  | 105056 | iscte-TiagoVarandas
João Costa | 105530 | CostinhaJ

=============================================================================================
# Sobre o Projeto
O projeto visa desenvolver uma aplicação para suporte à gestão de horários no Iscte. A aplicação permitirá carregar horários e salas a partir de arquivos CSV, mostrar e navegar nos horários e no cadastro de salas, além de oferecer funcionalidades avançadas, como sugestão de alocação de aulas e visualização gráfica das relações de conflitualidade e ocupação das salas

=============================================================================================
# Comandos

## Iniciar projeto com script

npm run-script run

## Iniciar projeto

node server.js

## Atualizar bundle
Conseguir ler código ECMAScript em uma versão compatível de JavaScript que pode ser executada em navegadores 
Se as alterações forem feitas no script.js é preciso executar seguinte comando.

npx webpack

## Executar testes

npm test
 
npm run lint

## Criar docs

jsdoc path/to/yourScript1.js path/to/yourScript2.js


=============================================================================================
# Funcionalidades Principais

# Carregamento de Horários e Salas:

O usuário pode carregar horários e salas a partir de arquivos CSV, localmente ou remotamente.
Visualização de Horários:

Mostra os horários em formato de tabela, permitindo navegação, ocultação e ordenação de colunas.
O usuário pode filtrar os dados por diferentes critérios, como curso, UC, turno, sala, etc.
Adiciona colunas para mostrar a semana do ano e do semestre das aulas.

# Cadastro de Salas:

Permite visualizar e navegar no cadastro de salas do Iscte.
O usuário pode filtrar as salas por características e disponibilidade.

# Gravação de Horários:

Permite gravar o horário alterado pelo usuário em CSV e JSON.

# Sugestão de Alocação de Aulas:

Sugerir slots para alocação de aulas de substituição ou de uma UC, considerando diferentes critérios definidos pelo usuário.
O usuário pode escolher, eliminar ou adicionar manualmente sugestões na tabela.

# Funcionalidades Imcompletas

Status das Visualizações Gráficas
Embora as funcionalidades principais para identificar conflitos e processar dados de ocupação de salas estejam implementadas, os componentes gráficos estão pendentes de finalização.






