# Sistema TechWall - Manual do Usuário

Bem-vindo ao TechWall! Este manual foi projetado para guiar os usuários através
das funcionalidades do sistema, desde a configuração inicial até a gestão do dia
a dia.

## Visão Geral

O sistema TechWall é uma solução completa para gerenciamento de produção e
vendas de casas pré-fabricadas. Ele abrange o controle de clientes, estoque,
produção de componentes, montagem de kits, vendas, finanças e entregas,
fornecendo uma visão integrada de todo o processo.

## Fluxo de Trabalho Principal

O fluxo de trabalho geral do sistema segue os seguintes passos:

1.  **Configuração Inicial**: Um administrador cadastra os usuários e clientes.
    Em seguida, o responsável pelo estoque deve cadastrar as referências dos
    materiais.
2.  **Produção de Placas**: Gerencia-se a produção das placas que compõem as
    casas.
3.  **Criação de Modelos**: São cadastrados os modelos de casas, especificando
    quais placas e materiais são necessários para cada um.
4.  **Registro de Venda**: Uma venda de um modelo de casa é registrada para um
    cliente.
5.  **Ordem de Produção**: A venda gera automaticamente uma ordem de produção
    para a montagem do kit da casa.
6.  **Ordem de Entrega**: Após a finalização da produção, uma ordem de entrega é
    criada para o despacho do kit.
7.  **Gestão Financeira**: O sistema acompanha os pagamentos das vendas e
    auxilia na gestão de compras de materiais.

---

## Módulos do Sistema

A seguir, uma descrição detalhada de cada módulo acessível pelo menu lateral.

### 1. Painel Principal (Dashboard)

Esta é a tela inicial do sistema. Ela oferece uma visão geral e rápida das
operações mais importantes, incluindo:

- **Vendas Totais**: Valor total acumulado das vendas.
- **Produções Ativas**: Quantidade de ordens de produção que não foram
  finalizadas.
- **Tempo Médio de Entrega**: Média de dias para concluir as entregas.
- **Visão Geral Mensal**: Gráfico com o faturamento mensal.
- **Status da Produção**: Gráfico de pizza mostrando a distribuição das ordens
  de produção por status (ex: Agendado, Montando, etc.).
- **Análise de Entregas**: Gráfico que compara entregas adiantadas, em dia e
  atrasadas.

### 2. Usuários

- **Função**: Gerenciar os usuários que podem acessar o sistema.
- **Como usar**:
  - **Adicionar Usuário**: Clique no botão "Adicionar usuário", preencha os
    dados (nome, e-mail, senha) e defina suas permissões (funções).
  - **Buscar**: Utilize o campo de busca para encontrar um usuário pelo nome ou
    e-mail.
  - **Editar/Excluir**: Na tabela, clique no menu de ações ao final da linha de
    um usuário para editar suas informações ou removê-lo do sistema.

### 3. Clientes

- **Função**: Manter um registro de todos os clientes da empresa.
- **Como usar**:
  - **Adicionar Cliente**: Clique em "Adicionar Cliente", preencha as
    informações de contato e salve.
  - **Buscar**: Use a busca para filtrar clientes por nome, e-mail ou número de
    contato.
  - **Editar/Excluir**: No menu de ações de cada cliente, você pode editar seus
    dados ou excluí-lo.

### 4. Estoque

- **Função**: Controlar todos os materiais usados na produção, desde o cadastro
  até a baixa e o recebimento de compras.
- **Este módulo possui 3 abas**:
  - **Painel**: Um dashboard específico do estoque, mostrando o número de itens
    distintos, itens com estoque baixo, e as datas da última entrada e saída de
    material.
  - **Estoque**:
    - **Adicionar Material**: Cadastre a **referência** de um novo material
      (parafusos, painéis, etc.), sua unidade de medida e o limite para alerta
      de estoque baixo.
    - **Registrar Movimentação**: Dê entrada ou saída manual de materiais no
      estoque.
    - **Tabela de Materiais**: Visualize todos os materiais, suas quantidades
      atuais e status (OK ou Estoque Baixo). É possível editar ou excluir uma
      referência de material.
  - **Recebimento**:
    - Nesta aba, você pode dar baixa em pedidos de compra que chegaram. A lista
      mostra os pedidos com status "Solicitado". Ao clicar em "Receber Pedido",
      você informa a quantidade que chegou, e o sistema atualiza o estoque.

### 5. Placas

- **Função**: Gerenciar a produção das placas, que são os componentes
  estruturais das casas.
- **Como usar**:
  - **Adicionar Placa**: Cadastre um novo tipo de placa, especificando seu nome,
    dimensões e os materiais necessários para produzi-la.
  - **Gerenciar Produção**: Para cada placa na lista, você pode:
    - **Gerenciar Produção**: Iniciar a produção de novas unidades. O sistema
      pedirá a quantidade e moverá o valor para a coluna "Em Produção", dando
      baixa nos materiais do estoque.
    - **Dar Baixa Direta**: Adiciona placas diretamente ao estoque de "Prontas",
      sem a necessidade de passar pela etapa "Em Produção". Esta função é um
      atalho para registrar a produção que foi feita sem o acompanhamento em
      tempo real no sistema (por exemplo, registrar o total produzido no final
      do dia).
  - A tabela principal mostra as quantidades de cada placa: aguardando produção,
    em produção e prontas para uso.

### 6. Modelos de Casas

- **Função**: Criar o catálogo de casas que a empresa vende.
- **Como usar**:
  - **Adicionar Modelo**: Clique em "Adicionar modelo" para criar um novo
    produto.
  - **Detalhes do Modelo**: Ao adicionar, você deve fornecer:
    - Nome e descrição.
    - Tempo estimado de fabricação.
    - Uma imagem da casa.
    - **Materiais e Placas**: A parte mais importante é associar quais
      **placas** e **materiais do estoque** são necessários para construir este
      modelo e em que quantidade.
  - **Ver Detalhes**: Nos cards, clique em "Ver detalhes" para visualizar as
    informações e os materiais de um modelo.

### 7. Vendas

- **Função**: Registrar e acompanhar o status das vendas.
- **Como usar**:
  - **Registrar Venda**: Clique em "Registrar Venda". Selecione o cliente, o
    modelo da casa vendido, defina o preço e a data.
  - **Acompanhamento**: A tabela principal exibe todas as vendas. Você pode
    buscar por cliente, modelo ou status.
  - **Ações da Venda**:
    - **Ver Detalhes**: Mostra todas as informações da venda.
    - **Alterar Status**: Permite atualizar o status da venda (ex: de "Em
      negociação" para "Confirmada").
    - **Cancelar Venda**: Altera o status da venda para "Cancelada".
  - **Importante**: Ao registrar uma venda, uma **Ordem de Produção** é gerada
    automaticamente.

### 8. Produção

- **Função**: Acompanhar o processo de montagem dos kits das casas que foram
  vendidas.
- **Como usar**:
  - **Visão Geral**: Esta tela lista todas as ordens de produção geradas a
    partir das vendas.
  - **Status do Kit**: A coluna "Status do Kit" mostra em que etapa a montagem
    está. Os status possíveis são:
    - `Materiais Pendentes`: O sistema verificou que não há material em estoque
      suficiente para iniciar a produção.
    - `Agendado`: Há material suficiente e a produção pode ser iniciada.
    - `Preparando / Montando`: A produção está em andamento.
    - `Pronto para Envio`: A montagem do kit foi finalizada.
  - **Ações da Produção**:
    - **Iniciar Produção**: Se o status for "Agendado", esta ação dá baixa no
      estoque dos materiais necessários.
    - **Alterar Status**: Atualiza o andamento da produção manualmente.
    - **Finalizar Produção**: Quando o kit está pronto, esta ação finaliza a
      ordem de produção e **gera automaticamente uma Ordem de Entrega**.

### 9. Entregas

- **Função**: Gerenciar a logística de entrega dos kits finalizados.
- **Como usar**:
  - **Visão Geral**: Lista todas as ordens de entrega geradas após a finalização
    de uma produção.
  - **Atualizar Entrega**: No menu de ações, é possível atualizar o status da
    entrega (ex: `Aguardando Transporte`, `Em Trânsito`, `Entregue`), adicionar
    o nome da transportadora e ajustar a previsão de entrega.

### 10. Financeiro

- **Função**: Controlar as finanças da empresa, incluindo contas a pagar, a
  receber e pedidos de compra.
- **Este módulo possui 4 abas**:
  - **Painel Financeiro**: Um dashboard com o resumo de valores recebidos,
    pagos, a receber e a pagar. Também exibe um alerta de "Itens com Estoque
    Baixo" que precisam ser comprados.
  - **Lançamentos**:
    - Aqui são listadas todas as contas a receber (geradas pelas vendas) e a
      pagar (despesas manuais).
    - **Pagar/Receber**: É possível editar um lançamento para registrar
      pagamentos parciais ou totais.
  - **Pedidos de Compra**:
    - **Alerta de Estoque Baixo**: Quando o painel indica estoque baixo, o setor
      financeiro pode vir a esta aba para criar um pedido de compra para o
      fornecedor.
    - **Acompanhamento**: A tabela mostra o status dos pedidos. Se um pedido
      chega com quantidade diferente da solicitada (registrado na tela de
      **Estoque > Recebimento**), ele aparecerá aqui com o status "Entregue com
      Alteração" para que o financeiro possa resolver a pendência com o
      fornecedor.
