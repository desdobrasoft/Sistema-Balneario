import 'package:casa_facil/src/models/account_entry_model.dart';
import 'package:casa_facil/src/models/delivery.dart';
import 'package:casa_facil/src/models/delivery_status.dart';
import 'package:casa_facil/src/models/delivery_time_stats.dart';
import 'package:casa_facil/src/models/financial_transaction_type.dart';
import 'package:casa_facil/src/models/invoice.dart';
import 'package:casa_facil/src/models/invoice_item.dart';
import 'package:casa_facil/src/models/invoice_type.dart';
import 'package:casa_facil/src/models/missing_stock_item_info.dart';
import 'package:casa_facil/src/models/monthly_sales.dart';
import 'package:casa_facil/src/models/production_order.dart';
import 'package:casa_facil/src/models/production_status_distribution.dart';
import 'package:casa_facil/src/models/status_pagamento.dart';

final accountEntries = [
  AccountEntryModel(
    id: 'ae1',
    description: 'Recebimento Venda #sale1 (Alice Silva)',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 68000,
    dueDate: '2023-10-15',
    paymentDate: '2023-10-14',
    status: StatusPagamento.from('Pago'),
    relatedSaleId: 1,
  ),
  AccountEntryModel(
    id: 'ae2',
    description: 'Compra de Placas Cimentícias - Pedido #PC001',
    type: FinancialTransactionType.fromDescription('Despesa'),
    amount: 25000,
    dueDate: '2023-11-10',
    paymentDate: '2023-11-09',
    status: StatusPagamento.from('Pago'),
    relatedPurchaseOrderId: 'po001',
    notes: 'Material para várias obras iniciais',
  ),
  AccountEntryModel(
    id: 'ae3',
    description: 'Recebimento Venda #sale2 (Roberto Construtor) - Entrada',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 40000,
    dueDate: '2023-11-01',
    status: StatusPagamento.from('Pendente'),
    relatedSaleId: 2,
  ),
  AccountEntryModel(
    id: 'ae4',
    description: 'Compra de Perfis de Aço - Pedido #PA002',
    type: FinancialTransactionType.fromDescription('Despesa'),
    amount: 15000,
    dueDate: '2023-11-20',
    status: StatusPagamento.from('Pendente'),
    relatedPurchaseOrderId: 'po002',
  ),
  AccountEntryModel(
    id: 'ae5',
    description: 'Recebimento Venda #sale3 (Alice Silva) - Sinal',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 20000,
    dueDate: '2024-01-20',
    paymentDate: '2024-01-19',
    status: StatusPagamento.from('Pago Parcialmente'),
    relatedSaleId: 3,
  ),
  AccountEntryModel(
    id: 'ae6',
    description: 'Recebimento Venda #sale4 (Carlos Prado)',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 68000,
    dueDate: '2024-03-10',
    status: StatusPagamento.from('Pendente'),
    relatedSaleId: 4,
  ),
  AccountEntryModel(
    id: 'ae7',
    description: 'Aluguel Contêiner para Kit #sale2',
    type: FinancialTransactionType.fromDescription('Despesa'),
    amount: 800,
    dueDate: '2023-11-05',
    status: StatusPagamento.from('Pago'),
    relatedPurchaseOrderId: 'po003',
  ),
];

final deliveries = [
  Delivery(
    id: 'del1',
    saleId: 1,
    customerId: 1,
    modelId: 1,
    deliveryAddress:
        'Rua da Fantasia, 123, Bairro dos Sonhos, Contolândia - SP, 01234-567',
    scheduledDate: '2023-10-30',
    transportCompany: 'Velozes Transportes Ltda.',
    status: DeliveryStatus.fromDescription('Entregue no Cliente'),
  ),
  Delivery(
    id: 'del2',
    saleId: 2,
    customerId: 2,
    modelId: 2,
    deliveryAddress:
        'Avenida da Construção, 456, Centro, Cidadela - RJ, 12345-000',
    scheduledDate: '2023-11-28',
    transportCompany: 'Logística Peso Pesado',
    status: DeliveryStatus.fromDescription('Em Trânsito'),
  ),
  Delivery(
    id: 'del3',
    saleId: 3,
    customerId: 1,
    modelId: 3,
    deliveryAddress:
        'Travessa da Comédia, 789, Vila Alegre, Alegria - MG, 23456-789',
    scheduledDate: '2024-02-20',
    transportCompany: 'Entrega Rápida Co.',
    status: DeliveryStatus.fromDescription('Coleta Agendada'),
  ),
  Delivery(
    id: 'del4',
    saleId: 4,
    customerId: 3,
    modelId: 2,
    deliveryAddress:
        'Alameda dos Jacarandás, 101, Bosque Imperial, Paraíso Verde - BA, 34567-890',
    scheduledDate: '2024-03-30',
    status: DeliveryStatus.fromDescription(
      'Pendente Atribuição Transportadora',
    ),
  ),
];

const deliveryTimeStats = [
  DeliveryTimeStats(count: 18, range: '10-12 dias'),
  DeliveryTimeStats(count: 22, range: '13-15 dias'),
  DeliveryTimeStats(count: 5, range: '>15 dias (Atraso Leve)'),
  DeliveryTimeStats(count: 2, range: 'Atrasadas (>5 dias)'),
];

final invoices = [
  Invoice(
    id: 'inv1',
    invoiceNumber: 'NF-00001',
    type: InvoiceType.fromDescription('Venda'),
    issueDate: '2023-10-15',
    customerName: 'Alice Silva',
    relatedSaleId: 'sale1',
    items: invoiceItemsSale1,
    subtotal: 68000,
    taxes: 0,
    totalAmount: 68000,
    status: StatusPagamento.from('Pago'),
    notes: 'NF referente à venda do kit CasaFácil Compacta 44m².',
  ),
  Invoice(
    id: 'inv2',
    invoiceNumber: 'NF-E-12345',
    type: InvoiceType.fromDescription('Compra'),
    issueDate: '2023-11-09',
    supplierName: 'Fornecedor de Aço XYZ',
    relatedAccountEntryId: 'ae2',
    items: invoiceItemsPurchase1,
    subtotal: 25000,
    taxes: 2500,
    totalAmount: 27500,
    status: StatusPagamento.from('Pago'),
    notes: 'NF de compra de materiais para estoque.',
  ),
  Invoice(
    id: 'inv3',
    invoiceNumber: 'NF-00002',
    type: InvoiceType.fromDescription('Venda'),
    issueDate: '2024-03-10',
    customerName: 'Carlos Almeida Prado',
    relatedSaleId: 'sale4',
    items: [
      InvoiceItem(
        id: 'item-s4-1',
        description: 'Kit CasaFácil Compacta 44m²',
        quantity: 1,
        unitPrice: 68000,
        totalPrice: 68000,
      ),
    ],
    subtotal: 68000,
    taxes: 0,
    totalAmount: 68000,
    status: StatusPagamento.from('Pendente'),
    notes: 'NF emitida, aguardando pagamento.',
  ),
];

const invoiceItemsPurchase1 = [
  InvoiceItem(
    id: 'item-p1-1',
    description: 'Placa Cimentícia Estrutural 1.20x2.40x10mm',
    quantity: 200,
    unitPrice: 100,
    totalPrice: 20000,
  ),
  InvoiceItem(
    id: 'item-p1-2',
    description: 'Perfil Montante Aço Galvanizado 90mm (barra 3m)',
    quantity: 50,
    unitPrice: 100,
    totalPrice: 5000,
  ),
];

const invoiceItemsSale1 = [
  InvoiceItem(
    id: 'item-s1-1',
    description: 'Kit CasaFácil Compacta 44m²',
    quantity: 1,
    unitPrice: 68000,
    totalPrice: 68000,
  ),
];

final missingItemsForSale3 = [
  MissingStockItemInfo(
    materialId: 'la-pet-isolamento',
    name: 'Lã de PET para isolamento termoacústico (50mm)',
    needed: 55,
    inStock: 10,
    unit: 'm²',
  ),
  MissingStockItemInfo(
    materialId: 'telha-termoacustica-eps30',
    name: 'Telha termoacústica (tipo sanduíche, EPS 30mm)',
    needed: 60,
    inStock: 40,
    unit: 'm²',
  ),
];

const monthlySales = [
  MonthlySales(month: 'Jan', sales: 120000),
  MonthlySales(month: 'Fev', sales: 180000),
  MonthlySales(month: 'Mar', sales: 150000),
  MonthlySales(month: 'Abr', sales: 210000),
  MonthlySales(month: 'Mai', sales: 160000),
  MonthlySales(month: 'Jun', sales: 250000),
];

final productionOrders = [
  ProductionOrder(
    id: 'prod1',
    saleId: 1,
    modelId: 1,
    customerId: 1,
    scheduledDate: '2023-10-16',
    status: ProductionOrderStatus.fromDescription('Pronto para Envio'),
    notes: '2023-10-28 10:00: Kit completo no contêiner. Aguardando coleta.',
    materialsAllocated: true,
  ),
  ProductionOrder(
    id: 'prod2',
    saleId: 2,
    modelId: 3,
    customerId: 2,
    scheduledDate: '2023-11-05',
    status: ProductionOrderStatus.fromDescription('Montando Kit no Contêiner'),
    notes:
        '2023-11-15 14:30: Materiais alocados. Iniciando montagem no contêiner.',
    materialsAllocated: true,
  ),
  ProductionOrder(
    id: 'prod3',
    saleId: 3,
    modelId: 2,
    customerId: 1,
    scheduledDate: '2024-02-01',
    status: ProductionOrderStatus.fromDescription(
      'Materiais Pendentes de Alocação',
    ),
    notes:
        '2024-02-05 09:15: Venda registrada com pendência de estoque. Aguardando reposição para Lã de PET e Telha Termoacústica. Verificar disponibilidade no módulo de estoque.',
    materialsAllocated: false,
  ),
  ProductionOrder(
    id: 'prod4',
    saleId: 4,
    modelId: 1,
    customerId: 3,
    scheduledDate: '2024-03-15',
    status: ProductionOrderStatus.fromDescription('Agendado'),
    notes:
        '2024-03-11 16:00: Produção agendada. Aguardando disponibilidade de equipe.',
    materialsAllocated: false,
  ),
];

const productionStatusDistribution = [
  ProductionStatusDistribution(count: 5, fill: '#e76e50', status: 'Agendados'),
  ProductionStatusDistribution(
    count: 12,
    fill: '#409d90',
    status: 'Em Progresso',
  ),
  ProductionStatusDistribution(
    count: 25,
    fill: '#274754',
    status: 'Concluídos',
  ),
  ProductionStatusDistribution(count: 2, fill: '#e8c468', status: 'Em Espera'),
];

// const _materialsModel44m = [
//   ModelMaterialItem(id: 'concreto-radier-25mpa', name: '', quantity: 9),
//   ModelMaterialItem(id: 'malha-aco-q61', name: '', quantity: 50),
//   ModelMaterialItem(id: 'placa-est-120x240x10', name: '', quantity: 45),
//   ModelMaterialItem(id: 'placa-std-100x240x10', name: '', quantity: 10),
//   ModelMaterialItem(id: 'placa-ref-130x250x12', name: '', quantity: 5),
//   ModelMaterialItem(id: 'placa-comp-090x240x10', name: '', quantity: 8),
//   ModelMaterialItem(id: 'perfil-montante-90mm', name: '', quantity: 350),
//   ModelMaterialItem(id: 'perfil-guia-90mm', name: '', quantity: 120),
//   ModelMaterialItem(id: 'parafuso-autobrocante', name: '', quantity: 1.5),
//   ModelMaterialItem(id: 'fita-junta', name: '', quantity: 2),
//   ModelMaterialItem(id: 'massa-junta', name: '', quantity: 2),
//   ModelMaterialItem(id: 'telha-fibrocimento', name: '', quantity: 20),
//   ModelMaterialItem(id: 'kit-eletrico-basico', name: '', quantity: 1),
//   ModelMaterialItem(id: 'kit-hidraulico-basico', name: '', quantity: 1),
//   ModelMaterialItem(id: 'janela-aluminio-120x100', name: '', quantity: 2),
//   ModelMaterialItem(id: 'janela-aluminio-060x060', name: '', quantity: 1),
//   ModelMaterialItem(id: 'porta-externa-aco', name: '', quantity: 1),
//   ModelMaterialItem(id: 'porta-interna-hdf', name: '', quantity: 2),
// ];

// const _materialsModel52m = [
//   ModelMaterialItem(id: 'concreto-radier-25mpa', name: '', quantity: 11),
//   ModelMaterialItem(id: 'malha-aco-q61', name: '', quantity: 60),
//   ModelMaterialItem(id: 'placa-est-120x240x10', name: '', quantity: 50),
//   ModelMaterialItem(id: 'placa-std-100x240x10', name: '', quantity: 12),
//   ModelMaterialItem(id: 'placa-hidro-120x240x12', name: '', quantity: 6),
//   ModelMaterialItem(id: 'placa-deco-120x240x8', name: '', quantity: 4),
//   ModelMaterialItem(id: 'perfil-montante-90mm', name: '', quantity: 420),
//   ModelMaterialItem(id: 'perfil-guia-90mm', name: '', quantity: 150),
//   ModelMaterialItem(id: 'parafuso-autobrocante', name: '', quantity: 1.8),
//   ModelMaterialItem(id: 'fita-junta', name: '', quantity: 2.4),
//   ModelMaterialItem(id: 'massa-junta', name: '', quantity: 3),
//   ModelMaterialItem(id: 'la-pet-isolamento', name: '', quantity: 55),
//   ModelMaterialItem(id: 'telha-termoacustica-eps30', name: '', quantity: 60),
//   ModelMaterialItem(id: 'kit-eletrico-basico', name: '', quantity: 1),
//   ModelMaterialItem(id: 'kit-hidraulico-750l', name: '', quantity: 1),
//   ModelMaterialItem(id: 'janela-aluminio-150x100', name: '', quantity: 2),
//   ModelMaterialItem(id: 'janela-aluminio-100x100', name: '', quantity: 1),
//   ModelMaterialItem(id: 'janela-aluminio-060x060', name: '', quantity: 1),
//   ModelMaterialItem(id: 'porta-externa-aluminio', name: '', quantity: 1),
//   ModelMaterialItem(id: 'porta-interna-hdf-080', name: '', quantity: 3),
// ];

// const _materialsModel56m = [
//   ModelMaterialItem(id: 'concreto-radier-25mpa', name: '', quantity: 12),
//   ModelMaterialItem(id: 'malha-aco-q75', name: '', quantity: 65),
//   ModelMaterialItem(id: 'placa-alta-perf-120x240x12', name: '', quantity: 55),
//   ModelMaterialItem(id: 'placa-superboard-120x240x10', name: '', quantity: 15),
//   ModelMaterialItem(id: 'placa-slim-100x200x8', name: '', quantity: 10),
//   ModelMaterialItem(id: 'placa-texturizada-120x240x10', name: '', quantity: 7),
//   ModelMaterialItem(id: 'perfil-montante-100mm', name: '', quantity: 450),
//   ModelMaterialItem(id: 'perfil-guia-100mm', name: '', quantity: 160),
//   ModelMaterialItem(id: 'parafuso-autobrocante', name: '', quantity: 2),
//   ModelMaterialItem(id: 'fita-junta', name: '', quantity: 2.6),
//   ModelMaterialItem(id: 'massa-junta', name: '', quantity: 3),
//   ModelMaterialItem(id: 'barreira-vapor', name: '', quantity: 60),
//   ModelMaterialItem(id: 'telha-shingle-kit', name: '', quantity: 70),
//   ModelMaterialItem(id: 'kit-eletrico-completo', name: '', quantity: 1),
//   ModelMaterialItem(id: 'kit-hidraulico-1000l-pex', name: '', quantity: 1),
//   ModelMaterialItem(id: 'janela-pvc-150x120', name: '', quantity: 2),
//   ModelMaterialItem(id: 'janela-pvc-080x080', name: '', quantity: 1),
//   ModelMaterialItem(id: 'janela-pvc-060x060', name: '', quantity: 1),
//   ModelMaterialItem(id: 'porta-externa-pivotante', name: '', quantity: 1),
//   ModelMaterialItem(id: 'porta-interna-laqueada', name: '', quantity: 3),
// ];

// const customers = [
//   CustomerModel(
//     id: 'cust1',
//     name: 'Alice Silva',
//     email: 'alice@exemplo.com',
//     phone: '(11) 98765-4321',
//     address:
//         'Rua da Fantasia, 123, Bairro dos Sonhos, Contolândia - SP, 01234-567',
//     salesHistoryCount: 2,
//   ),
//   CustomerModel(
//     id: 'cust2',
//     name: 'Roberto Construtor',
//     email: 'roberto@construtoraex.com',
//     phone: '(21) 91234-5678',
//     address: 'Avenida da Construção, 456, Centro, Cidadela - RJ, 12345-000',
//     salesHistoryCount: 5,
//   ),
//   CustomerModel(
//     id: 'cust3',
//     name: 'Carlos Almeida Prado',
//     email: 'carlos.prado@email.com',
//     phone: '(31) 95678-1234',
//     address: 'Travessa da Comédia, 789, Vila Alegre, Alegria - MG, 23456-789',
//     salesHistoryCount: 1,
//   ),
// ];

// const houseModels = [
//   HouseModel(
//     id: 'model44',
//     name: 'CasaFácil Compacta 44m²',
//     description:
//         'Eficiência e praticidade em 44m². Ideal para quem busca um lar aconchegante e funcional, com 1 quarto, sala/cozinha integrada e banheiro. Kit completo.',
//     materials: _materialsModel44m,
//     productionTime: standardProductionTime,
//     imageUrl: 'https://placehold.co/600x400.png',
//     price: 68000,
//   ),
//   HouseModel(
//     id: 'model52',
//     name: 'CasaFácil Conforto 52m²',
//     description:
//         'Conforto e bom aproveitamento de espaço em 52m². Com 2 quartos, sala de estar, cozinha e banheiro. Perfeita para pequenas famílias. Kit completo.',
//     materials: _materialsModel52m,
//     productionTime: standardProductionTime,
//     imageUrl: 'https://placehold.co/600x400.png',
//     price: 82000,
//   ),
//   HouseModel(
//     id: 'model56',
//     name: 'CasaFácil Família 56m²',
//     description:
//         'Espaço e versatilidade em 56m². Oferece 2 quartos (sendo 1 suíte), sala ampla, cozinha, banheiro social e área de serviço. Ideal para quem precisa de mais espaço. Kit completo.',
//     materials: _materialsModel56m,
//     productionTime: standardProductionTime,
//     imageUrl: 'https://placehold.co/600x400.png',
//     price: 95000,
//   ),
// ];

// final sale1History = [
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Aguardando Agendamento de Produção'),
//     date: '2023-10-15 10:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Produção Agendada'),
//     date: '2023-10-16 09:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Kit em Preparação'),
//     date: '2023-10-18 14:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Pronto para Envio'),
//     date: '2023-10-28 10:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Enviado'),
//     date: '2023-10-29 11:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Entregue'),
//     date: '2023-10-30 16:00:00',
//   ),
// ];

// final sale2History = [
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Aguardando Agendamento de Produção'),
//     date: '2023-11-01 11:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Produção Agendada'),
//     date: '2023-11-05 09:30:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Kit em Preparação'),
//     date: '2023-11-15 14:30:00',
//     notes: 'Iniciada montagem no contêiner.',
//   ),
// ];

// final sale3History = [
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Aguardando Reposição de Estoque'),
//     date: '2024-01-20 15:00:00',
//     notes: 'Pendente Lã de PET e Telha Termoacústica.',
//   ),
// ];

// final sale4History = [
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Aguardando Agendamento de Produção'),
//     date: '2024-03-10 10:00:00',
//   ),
//   SaleStatusHistoryEntry(
//     status: SaleStatus.fromDescription('Produção Agendada'),
//     date: '2024-03-11 16:00:00',
//     notes: 'Produção agendada. Aguardando disponibilidade de equipe.',
//   ),
// ];

// final sales = [
//   Sale(
//     id: 'sale1',
//     customerId: 'cust1',
//     modelId: 'model44',
//     saleDate: '2023-10-15',
//     price: 68000,
//     status: SaleStatus.fromDescription('Entregue'),
//     paymentStatus: StatusPagamento.from('Pago'),
//     statusHistory: sale1History,
//   ),
//   Sale(
//     id: 'sale2',
//     customerId: 'cust2',
//     modelId: 'model56',
//     saleDate: '2023-11-01',
//     price: 95000,
//     status: SaleStatus.fromDescription('Kit em Preparação'),
//     paymentStatus: StatusPagamento.from('Pendente'),
//     statusHistory: sale2History,
//   ),
//   Sale(
//     id: 'sale3',
//     customerId: 'cust1',
//     modelId: 'model52',
//     saleDate: '2024-01-20',
//     price: 82000,
//     status: SaleStatus.fromDescription('Aguardando Reposição de Estoque'),
//     paymentStatus: StatusPagamento.from('Pago Parcialmente'),
//     missingStockItems: missingItemsForSale3,
//     statusHistory: sale3History,
//   ),
//   Sale(
//     id: 4,
//     customerId: 'cust3',
//     modelId: 'model44',
//     saleDate: '2024-03-10',
//     price: 68000,
//     status: SaleStatus.fromDescription('Produção Agendada'),
//     paymentStatus: StatusPagamento.from('Pendente'),
//     statusHistory: sale4History,
//   ),
// ];

// const standardProductionTime = "10-15 dias úteis";

// const stockItems = [
//   /////////////////////////////////////////////////////////////////////// Placas
//   MateriaisEstoque(
//     id: 'placa-est-120x240x10',
//     nome: 'Placa Cimentícia Estrutural (1.20m x 2.40m x 10mm)',
//     qtEstoque: 150,
//     limBaixoEstoque: 30,
//     lastEntryDate: '2024-03-01',
//   ),
//   MateriaisEstoque(
//     id: 'placa-std-100x240x10',
//     nome: 'Placa Cimentícia Standard (1.00m x 2.40m x 10mm)',
//     qtEstoque: 80,
//     limBaixoEstoque: 20,
//     lastEntryDate: '2024-03-01',
//   ),
//   MateriaisEstoque(
//     id: 'placa-ref-130x250x12',
//     nome: 'Placa Cimentícia Reforçada (1.30m x 2.50m x 12mm)',
//     qtEstoque: 50,
//     limBaixoEstoque: 10,
//     lastEntryDate: '2024-02-15',
//   ),
//   MateriaisEstoque(
//     id: 'placa-comp-090x240x10',
//     nome: 'Placa Cimentícia Compacta (0.90m x 2.40m x 10mm)',
//     qtEstoque: 60,
//     limBaixoEstoque: 15,
//     lastEntryDate: '2024-02-15',
//   ),
//   MateriaisEstoque(
//     id: 'placa-hidro-120x240x12',
//     nome: 'Placa Cimentícia Hidrofugada (1.20m x 2.40m x 12mm)',
//     qtEstoque: 40,
//     limBaixoEstoque: 10,
//   ),
//   MateriaisEstoque(
//     id: 'placa-deco-120x240x8',
//     nome: 'Placa Cimentícia Decorativa (1.20m x 2.40m x 8mm)',
//     qtEstoque: 30,
//     limBaixoEstoque: 5,
//   ),
//   MateriaisEstoque(
//     id: 'placa-alta-perf-120x240x12',
//     nome: 'Placa Cimentícia Alta Performance (1.20m x 2.40m x 12mm)',
//     qtEstoque: 35,
//     limBaixoEstoque: 10,
//   ),
//   MateriaisEstoque(
//     id: 'placa-superboard-120x240x10',
//     nome: 'Placa Cimentícia Superboard (1.20m x 2.40m x 10mm)',
//     qtEstoque: 45,
//     limBaixoEstoque: 10,
//   ),
//   MateriaisEstoque(
//     id: 'placa-slim-100x200x8',
//     nome: 'Placa Cimentícia Slim (1.00m x 2.00m x 8mm)',
//     qtEstoque: 25,
//     limBaixoEstoque: 5,
//   ),
//   MateriaisEstoque(
//     id: 'placa-texturizada-120x240x10',
//     nome: 'Placa Cimentícia Texturizada (1.20m x 2.40m x 10mm)',
//     qtEstoque: 20,
//     limBaixoEstoque: 5,
//   ),

//   /////////////////////////////////////////////////////////////////////// Perfis
//   MateriaisEstoque(
//     id: 'perfil-montante-90mm',
//     nome: 'Perfil de aço galvanizado (montante 90mm)',
//     qtEstoque: 1200,
//     limBaixoEstoque: 200,
//     lastEntryDate: '2024-03-05',
//   ),
//   MateriaisEstoque(
//     id: 'perfil-guia-90mm',
//     nome: 'Perfil de aço galvanizado (guia 90mm)',
//     qtEstoque: 500,
//     limBaixoEstoque: 100,
//     lastEntryDate: '2024-03-05',
//   ),
//   MateriaisEstoque(
//     id: 'perfil-montante-100mm',
//     nome: 'Perfil de aço galvanizado (montante 100mm)',
//     qtEstoque: 800,
//     limBaixoEstoque: 150,
//   ),
//   MateriaisEstoque(
//     id: 'perfil-guia-100mm',
//     nome: 'Perfil de aço galvanizado (guia 100mm)',
//     qtEstoque: 400,
//     limBaixoEstoque: 80,
//   ),

//   ////////////////////////////////////////////////////// Fixadores e Acabamentos
//   MateriaisEstoque(
//     id: 'parafuso-autobrocante',
//     nome: 'Parafuso autobrocante para aço',
//     qtEstoque: 10,
//     limBaixoEstoque: 2,
//     lastEntryDate: '2024-02-20',
//   ),
//   MateriaisEstoque(
//     id: 'fita-junta',
//     nome: 'Fita de junta para placas cimentícias',
//     qtEstoque: 30,
//     limBaixoEstoque: 5,
//     lastEntryDate: '2024-02-20',
//   ),
//   MateriaisEstoque(
//     id: 'massa-junta',
//     nome: 'Massa para tratamento de juntas (placas cimentícias)',
//     qtEstoque: 20,
//     limBaixoEstoque: 4,
//     lastEntryDate: '2024-02-20',
//   ),
//   MateriaisEstoque(
//     id: 'la-pet-isolamento',
//     nome: 'Lã de PET para isolamento termoacústico (50mm)',
//     qtEstoque: 10,
//     limBaixoEstoque: 50,
//   ), // Estoque baixo para teste
//   MateriaisEstoque(
//     id: 'barreira-vapor',
//     nome: 'Barreira de vapor (membrana hidrófuga)',
//     qtEstoque: 150,
//     limBaixoEstoque: 30,
//   ),

//   //////////////////////////////////////////////////////////////////// Cobertura
//   MateriaisEstoque(
//     id: 'telha-fibrocimento',
//     nome: 'Telha de fibrocimento ondulada (6mm espessura, 2.44m x 1.10m)',
//     qtEstoque: 100,
//     limBaixoEstoque: 20,
//     lastEntryDate: '2024-01-10',
//   ),
//   MateriaisEstoque(
//     id: 'telha-termoacustica-eps30',
//     nome: 'Telha termoacústica (tipo sanduíche, EPS 30mm)',
//     qtEstoque: 40,
//     limBaixoEstoque: 50,
//   ),

//   ///////////////////////////////////////////////////// Estoque baixo para teste
//   MateriaisEstoque(
//     id: 'telha-shingle-kit',
//     nome: 'Kit Telha Shingle (inclui base, telhas, fixadores)',
//     qtEstoque: 150,
//     limBaixoEstoque: 30,
//   ),

//   ////////////////////////////////////////////////////////////////// Instalações
//   MateriaisEstoque(
//     id: 'kit-eletrico-basico',
//     nome: 'Kit Elétrico Básico (fios, disjuntores, tomadas)',
//     qtEstoque: 15,
//     limBaixoEstoque: 3,
//     lastEntryDate: '2024-01-15',
//   ),
//   MateriaisEstoque(
//     id: 'kit-hidraulico-basico',
//     nome: 'Kit Hidráulico Básico (tubos PVC, conexões, caixa 500L)',
//     qtEstoque: 12,
//     limBaixoEstoque: 3,
//     lastEntryDate: '2024-01-15',
//   ),
//   MateriaisEstoque(
//     id: 'kit-hidraulico-750l',
//     nome: 'Kit Hidráulico (tubos PVC/PEX, conexões, caixa 750L)',
//     qtEstoque: 10,
//     limBaixoEstoque: 2,
//   ),
//   MateriaisEstoque(
//     id: 'kit-eletrico-completo',
//     nome: 'Kit Elétrico Completo (DR/DPS, fiação, ar cond.)',
//     qtEstoque: 8,
//     limBaixoEstoque: 2,
//   ),
//   MateriaisEstoque(
//     id: 'kit-hidraulico-1000l-pex',
//     nome: 'Kit Hidráulico PEX (água fria/quente, caixa 1000L)',
//     qtEstoque: 7,
//     limBaixoEstoque: 2,
//   ),

//   ///////////////////////////////////////////////////////////////////// Fundação
//   MateriaisEstoque(
//     id: 'concreto-radier-25mpa',
//     nome: 'Concreto usinado para radier (25 MPA)',
//     qtEstoque: 50,
//     limBaixoEstoque: 10,
//     lastEntryDate: '2024-03-10',
//   ),
//   MateriaisEstoque(
//     id: 'malha-aco-q61',
//     nome: 'Malha de aço (Q61 - 15x15cm)',
//     qtEstoque: 300,
//     limBaixoEstoque: 50,
//     lastEntryDate: '2024-03-10',
//   ),
//   MateriaisEstoque(
//     id: 'malha-aco-q75',
//     nome: 'Malha de aço (Q75 - 10x10cm)',
//     qtEstoque: 200,
//     limBaixoEstoque: 40,
//   ),

//   //////////////////////////////////////////////////////// Esquadrias (Exemplos)
//   MateriaisEstoque(
//     id: 'janela-aluminio-120x100',
//     nome: 'Janela de alumínio branco (1.20m x 1.00m)',
//     qtEstoque: 30,
//     limBaixoEstoque: 5,
//   ),
//   MateriaisEstoque(
//     id: 'janela-aluminio-060x060',
//     nome: 'Janela de alumínio branco (0.60m x 0.60m - banheiro)',
//     qtEstoque: 20,
//     limBaixoEstoque: 4,
//   ),
//   MateriaisEstoque(
//     id: 'porta-externa-aco',
//     nome: 'Porta externa de aço (0.80m x 2.10m)',
//     qtEstoque: 15,
//     limBaixoEstoque: 3,
//   ),
//   MateriaisEstoque(
//     id: 'porta-interna-hdf',
//     nome: 'Porta interna de madeira HDF (0.70m x 2.10m)',
//     qtEstoque: 40,
//     limBaixoEstoque: 8,
//   ),
//   MateriaisEstoque(
//     id: 'janela-aluminio-150x100',
//     nome: 'Janela de alumínio branco (1.50m x 1.00m)',
//     qtEstoque: 25,
//     limBaixoEstoque: 5,
//   ),
//   MateriaisEstoque(
//     id: 'janela-aluminio-100x100',
//     nome: 'Janela de alumínio branco (1.00m x 1.00m)',
//     qtEstoque: 15,
//     limBaixoEstoque: 3,
//   ),
//   MateriaisEstoque(
//     id: 'porta-externa-aluminio',
//     nome: 'Porta externa de alumínio (0.90m x 2.10m)',
//     qtEstoque: 10,
//     limBaixoEstoque: 2,
//   ),
//   MateriaisEstoque(
//     id: 'porta-interna-hdf-080',
//     nome: 'Porta interna de madeira HDF (0.80m x 2.10m)',
//     qtEstoque: 30,
//     limBaixoEstoque: 6,
//   ),
//   MateriaisEstoque(
//     id: 'janela-pvc-150x120',
//     nome: 'Janela de PVC com vidro duplo (1.50m x 1.20m)',
//     qtEstoque: 20,
//     limBaixoEstoque: 4,
//   ),
//   MateriaisEstoque(
//     id: 'janela-pvc-080x080',
//     nome: 'Janela de PVC com vidro duplo (0.80m x 0.80m - cozinha)',
//     qtEstoque: 10,
//     limBaixoEstoque: 2,
//   ),
//   MateriaisEstoque(
//     id: 'janela-pvc-060x060',
//     nome: 'Janela de PVC com vidro duplo (0.60m x 0.60m - banheiro)',
//     qtEstoque: 12,
//     limBaixoEstoque: 3,
//   ),
//   MateriaisEstoque(
//     id: 'porta-externa-pivotante',
//     nome: 'Porta externa pivotante de madeira (1.00m x 2.10m)',
//     qtEstoque: 8,
//     limBaixoEstoque: 2,
//   ),
//   MateriaisEstoque(
//     id: 'porta-interna-laqueada',
//     nome: 'Porta interna de madeira laqueada (0.80m x 2.10m)',
//     qtEstoque: 20,
//     limBaixoEstoque: 4,
//   ),
// ];
