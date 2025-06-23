import 'package:sistema_balneario/src/models/account_entry_model.dart';
import 'package:sistema_balneario/src/models/customer.dart';
import 'package:sistema_balneario/src/models/delivery.dart';
import 'package:sistema_balneario/src/models/delivery_status.dart';
import 'package:sistema_balneario/src/models/delivery_time_stats.dart';
import 'package:sistema_balneario/src/models/financial_transaction_type.dart';
import 'package:sistema_balneario/src/models/house_model.dart';
import 'package:sistema_balneario/src/models/invoice.dart';
import 'package:sistema_balneario/src/models/invoice_item.dart';
import 'package:sistema_balneario/src/models/invoice_type.dart';
import 'package:sistema_balneario/src/models/missing_stock_item_info.dart';
import 'package:sistema_balneario/src/models/model_material_item.dart';
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/models/payment_status.dart';
import 'package:sistema_balneario/src/models/production_order.dart';
import 'package:sistema_balneario/src/models/production_status_distribution.dart';
import 'package:sistema_balneario/src/models/sale.dart';
import 'package:sistema_balneario/src/models/sale_status.dart';
import 'package:sistema_balneario/src/models/sale_status_history_entry.dart';
import 'package:sistema_balneario/src/models/stock_item.dart';

const _materialsModel44m = [
  ModelMaterialItem(id: 'concreto-radier-25mpa', quantity: 9),
  ModelMaterialItem(id: 'malha-aco-q61', quantity: 50),
  ModelMaterialItem(id: 'placa-est-120x240x10', quantity: 45),
  ModelMaterialItem(id: 'placa-std-100x240x10', quantity: 10),
  ModelMaterialItem(id: 'placa-ref-130x250x12', quantity: 5),
  ModelMaterialItem(id: 'placa-comp-090x240x10', quantity: 8),
  ModelMaterialItem(id: 'perfil-montante-90mm', quantity: 350),
  ModelMaterialItem(id: 'perfil-guia-90mm', quantity: 120),
  ModelMaterialItem(id: 'parafuso-autobrocante', quantity: 1.5),
  ModelMaterialItem(id: 'fita-junta', quantity: 2),
  ModelMaterialItem(id: 'massa-junta', quantity: 2),
  ModelMaterialItem(id: 'telha-fibrocimento', quantity: 20),
  ModelMaterialItem(id: 'kit-eletrico-basico', quantity: 1),
  ModelMaterialItem(id: 'kit-hidraulico-basico', quantity: 1),
  ModelMaterialItem(id: 'janela-aluminio-120x100', quantity: 2),
  ModelMaterialItem(id: 'janela-aluminio-060x060', quantity: 1),
  ModelMaterialItem(id: 'porta-externa-aco', quantity: 1),
  ModelMaterialItem(id: 'porta-interna-hdf', quantity: 2),
];

const _materialsModel52m = [
  ModelMaterialItem(id: 'concreto-radier-25mpa', quantity: 11),
  ModelMaterialItem(id: 'malha-aco-q61', quantity: 60),
  ModelMaterialItem(id: 'placa-est-120x240x10', quantity: 50),
  ModelMaterialItem(id: 'placa-std-100x240x10', quantity: 12),
  ModelMaterialItem(id: 'placa-hidro-120x240x12', quantity: 6),
  ModelMaterialItem(id: 'placa-deco-120x240x8', quantity: 4),
  ModelMaterialItem(id: 'perfil-montante-90mm', quantity: 420),
  ModelMaterialItem(id: 'perfil-guia-90mm', quantity: 150),
  ModelMaterialItem(id: 'parafuso-autobrocante', quantity: 1.8),
  ModelMaterialItem(id: 'fita-junta', quantity: 2.4),
  ModelMaterialItem(id: 'massa-junta', quantity: 3),
  ModelMaterialItem(id: 'la-pet-isolamento', quantity: 55),
  ModelMaterialItem(id: 'telha-termoacustica-eps30', quantity: 60),
  ModelMaterialItem(id: 'kit-eletrico-basico', quantity: 1),
  ModelMaterialItem(id: 'kit-hidraulico-750l', quantity: 1),
  ModelMaterialItem(id: 'janela-aluminio-150x100', quantity: 2),
  ModelMaterialItem(id: 'janela-aluminio-100x100', quantity: 1),
  ModelMaterialItem(id: 'janela-aluminio-060x060', quantity: 1),
  ModelMaterialItem(id: 'porta-externa-aluminio', quantity: 1),
  ModelMaterialItem(id: 'porta-interna-hdf-080', quantity: 3),
];

const _materialsModel56m = [
  ModelMaterialItem(id: 'concreto-radier-25mpa', quantity: 12),
  ModelMaterialItem(id: 'malha-aco-q75', quantity: 65),
  ModelMaterialItem(id: 'placa-alta-perf-120x240x12', quantity: 55),
  ModelMaterialItem(id: 'placa-superboard-120x240x10', quantity: 15),
  ModelMaterialItem(id: 'placa-slim-100x200x8', quantity: 10),
  ModelMaterialItem(id: 'placa-texturizada-120x240x10', quantity: 7),
  ModelMaterialItem(id: 'perfil-montante-100mm', quantity: 450),
  ModelMaterialItem(id: 'perfil-guia-100mm', quantity: 160),
  ModelMaterialItem(id: 'parafuso-autobrocante', quantity: 2),
  ModelMaterialItem(id: 'fita-junta', quantity: 2.6),
  ModelMaterialItem(id: 'massa-junta', quantity: 3),
  ModelMaterialItem(id: 'barreira-vapor', quantity: 60),
  ModelMaterialItem(id: 'telha-shingle-kit', quantity: 70),
  ModelMaterialItem(id: 'kit-eletrico-completo', quantity: 1),
  ModelMaterialItem(id: 'kit-hidraulico-1000l-pex', quantity: 1),
  ModelMaterialItem(id: 'janela-pvc-150x120', quantity: 2),
  ModelMaterialItem(id: 'janela-pvc-080x080', quantity: 1),
  ModelMaterialItem(id: 'janela-pvc-060x060', quantity: 1),
  ModelMaterialItem(id: 'porta-externa-pivotante', quantity: 1),
  ModelMaterialItem(id: 'porta-interna-laqueada', quantity: 3),
];

final accountEntries = [
  AccountEntryModel(
    id: 'ae1',
    description: 'Recebimento Venda #sale1 (Alice Silva)',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 68000,
    dueDate: '2023-10-15',
    paymentDate: '2023-10-14',
    status: PaymentStatus.fromDescription('Pago'),
    relatedSaleId: 'sale1',
  ),
  AccountEntryModel(
    id: 'ae2',
    description: 'Compra de Placas Cimentícias - Pedido #PC001',
    type: FinancialTransactionType.fromDescription('Despesa'),
    amount: 25000,
    dueDate: '2023-11-10',
    paymentDate: '2023-11-09',
    status: PaymentStatus.fromDescription('Pago'),
    relatedPurchaseOrderId: 'po001',
    notes: 'Material para várias obras iniciais',
  ),
  AccountEntryModel(
    id: 'ae3',
    description: 'Recebimento Venda #sale2 (Roberto Construtor) - Entrada',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 40000,
    dueDate: '2023-11-01',
    status: PaymentStatus.fromDescription('Pendente'),
    relatedSaleId: 'sale2',
  ),
  AccountEntryModel(
    id: 'ae4',
    description: 'Compra de Perfis de Aço - Pedido #PA002',
    type: FinancialTransactionType.fromDescription('Despesa'),
    amount: 15000,
    dueDate: '2023-11-20',
    status: PaymentStatus.fromDescription('Pendente'),
    relatedPurchaseOrderId: 'po002',
  ),
  AccountEntryModel(
    id: 'ae5',
    description: 'Recebimento Venda #sale3 (Alice Silva) - Sinal',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 20000,
    dueDate: '2024-01-20',
    paymentDate: '2024-01-19',
    status: PaymentStatus.fromDescription('Pago Parcialmente'),
    relatedSaleId: 'sale3',
  ),
  AccountEntryModel(
    id: 'ae6',
    description: 'Recebimento Venda #sale4 (Carlos Prado)',
    type: FinancialTransactionType.fromDescription('Receita'),
    amount: 68000,
    dueDate: '2024-03-10',
    status: PaymentStatus.fromDescription('Pendente'),
    relatedSaleId: 'sale4',
  ),
  AccountEntryModel(
    id: 'ae7',
    description: 'Aluguel Contêiner para Kit #sale2',
    type: FinancialTransactionType.fromDescription('Despesa'),
    amount: 800,
    dueDate: '2023-11-05',
    status: PaymentStatus.fromDescription('Pago'),
    relatedPurchaseOrderId: 'po003',
  ),
];

const customers = [
  CustomerModel(
    id: 'cust1',
    name: 'Alice Silva',
    email: 'alice@exemplo.com',
    phone: '(11) 98765-4321',
    address:
        'Rua da Fantasia, 123, Bairro dos Sonhos, Contolândia - SP, 01234-567',
    salesHistoryCount: 2,
  ),
  CustomerModel(
    id: 'cust2',
    name: 'Roberto Construtor',
    email: 'roberto@construtoraex.com',
    phone: '(21) 91234-5678',
    address: 'Avenida da Construção, 456, Centro, Cidadela - RJ, 12345-000',
    salesHistoryCount: 5,
  ),
  CustomerModel(
    id: 'cust3',
    name: 'Carlos Almeida Prado',
    email: 'carlos.prado@email.com',
    phone: '(31) 95678-1234',
    address: 'Travessa da Comédia, 789, Vila Alegre, Alegria - MG, 23456-789',
    salesHistoryCount: 1,
  ),
];

final deliveries = [
  Delivery(
    id: 'del1',
    saleId: 'sale1',
    customerId: 'cust1',
    modelId: 'model44',
    deliveryAddress:
        'Rua da Fantasia, 123, Bairro dos Sonhos, Contolândia - SP, 01234-567',
    scheduledDate: '2023-10-30',
    transportCompany: 'Velozes Transportes Ltda.',
    status: DeliveryStatus.fromDescription('Entregue no Cliente'),
  ),
  Delivery(
    id: 'del2',
    saleId: 'sale2',
    customerId: 'cust2',
    modelId: 'model56',
    deliveryAddress:
        'Avenida da Construção, 456, Centro, Cidadela - RJ, 12345-000',
    scheduledDate: '2023-11-28',
    transportCompany: 'Logística Peso Pesado',
    status: DeliveryStatus.fromDescription('Em Trânsito'),
  ),
  Delivery(
    id: 'del3',
    saleId: 'sale3',
    customerId: 'cust1',
    modelId: 'model52',
    deliveryAddress:
        'Travessa da Comédia, 789, Vila Alegre, Alegria - MG, 23456-789',
    scheduledDate: '2024-02-20',
    transportCompany: 'Entrega Rápida Co.',
    status: DeliveryStatus.fromDescription('Coleta Agendada'),
  ),
  Delivery(
    id: 'del4',
    saleId: 'sale4',
    customerId: 'cust3',
    modelId: 'model44',
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

const houseModels = [
  HouseModel(
    id: 'model44',
    name: 'CasaFácil Compacta 44m²',
    description:
        'Eficiência e praticidade em 44m². Ideal para quem busca um lar aconchegante e funcional, com 1 quarto, sala/cozinha integrada e banheiro. Kit completo.',
    materials: _materialsModel44m,
    productionTime: standardProductionTime,
    imageUrl: 'https://placehold.co/600x400.png',
    price: 68000,
  ),
  HouseModel(
    id: 'model52',
    name: 'CasaFácil Conforto 52m²',
    description:
        'Conforto e bom aproveitamento de espaço em 52m². Com 2 quartos, sala de estar, cozinha e banheiro. Perfeita para pequenas famílias. Kit completo.',
    materials: _materialsModel52m,
    productionTime: standardProductionTime,
    imageUrl: 'https://placehold.co/600x400.png',
    price: 82000,
  ),
  HouseModel(
    id: 'model56',
    name: 'CasaFácil Família 56m²',
    description:
        'Espaço e versatilidade em 56m². Oferece 2 quartos (sendo 1 suíte), sala ampla, cozinha, banheiro social e área de serviço. Ideal para quem precisa de mais espaço. Kit completo.',
    materials: _materialsModel56m,
    productionTime: standardProductionTime,
    imageUrl: 'https://placehold.co/600x400.png',
    price: 95000,
  ),
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
    status: PaymentStatus.fromDescription('Pago'),
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
    status: PaymentStatus.fromDescription('Pago'),
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
    status: PaymentStatus.fromDescription('Pendente'),
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
    saleId: 'sale1',
    modelId: 'model44',
    customerId: 'cust1',
    scheduledDate: '2023-10-16',
    status: ProductionOrderStatus.fromDescription('Pronto para Envio'),
    notes: '2023-10-28 10:00: Kit completo no contêiner. Aguardando coleta.',
    materialsAllocated: true,
  ),
  ProductionOrder(
    id: 'prod2',
    saleId: 'sale2',
    modelId: 'model56',
    customerId: 'cust2',
    scheduledDate: '2023-11-05',
    status: ProductionOrderStatus.fromDescription('Montando Kit no Contêiner'),
    notes:
        '2023-11-15 14:30: Materiais alocados. Iniciando montagem no contêiner.',
    materialsAllocated: true,
  ),
  ProductionOrder(
    id: 'prod3',
    saleId: 'sale3',
    modelId: 'model52',
    customerId: 'cust1',
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
    saleId: 'sale4',
    modelId: 'model44',
    customerId: 'cust3',
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

final sale1History = [
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Aguardando Agendamento de Produção'),
    date: '2023-10-15 10:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Produção Agendada'),
    date: '2023-10-16 09:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Kit em Preparação'),
    date: '2023-10-18 14:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Pronto para Envio'),
    date: '2023-10-28 10:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Enviado'),
    date: '2023-10-29 11:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Entregue'),
    date: '2023-10-30 16:00:00',
  ),
];

final sale2History = [
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Aguardando Agendamento de Produção'),
    date: '2023-11-01 11:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Produção Agendada'),
    date: '2023-11-05 09:30:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Kit em Preparação'),
    date: '2023-11-15 14:30:00',
    notes: 'Iniciada montagem no contêiner.',
  ),
];

final sale3History = [
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Aguardando Reposição de Estoque'),
    date: '2024-01-20 15:00:00',
    notes: 'Pendente Lã de PET e Telha Termoacústica.',
  ),
];

final sale4History = [
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Aguardando Agendamento de Produção'),
    date: '2024-03-10 10:00:00',
  ),
  SaleStatusHistoryEntry(
    status: SaleStatus.fromDescription('Produção Agendada'),
    date: '2024-03-11 16:00:00',
    notes: 'Produção agendada. Aguardando disponibilidade de equipe.',
  ),
];

final sales = [
  Sale(
    id: 'sale1',
    customerId: 'cust1',
    modelId: 'model44',
    saleDate: '2023-10-15',
    price: 68000,
    status: SaleStatus.fromDescription('Entregue'),
    paymentStatus: PaymentStatus.fromDescription('Pago'),
    statusHistory: sale1History,
  ),
  Sale(
    id: 'sale2',
    customerId: 'cust2',
    modelId: 'model56',
    saleDate: '2023-11-01',
    price: 95000,
    status: SaleStatus.fromDescription('Kit em Preparação'),
    paymentStatus: PaymentStatus.fromDescription('Pendente'),
    statusHistory: sale2History,
  ),
  Sale(
    id: 'sale3',
    customerId: 'cust1',
    modelId: 'model52',
    saleDate: '2024-01-20',
    price: 82000,
    status: SaleStatus.fromDescription('Aguardando Reposição de Estoque'),
    paymentStatus: PaymentStatus.fromDescription('Pago Parcialmente'),
    missingStockItems: missingItemsForSale3,
    statusHistory: sale3History,
  ),
  Sale(
    id: 'sale4',
    customerId: 'cust3',
    modelId: 'model44',
    saleDate: '2024-03-10',
    price: 68000,
    status: SaleStatus.fromDescription('Produção Agendada'),
    paymentStatus: PaymentStatus.fromDescription('Pendente'),
    statusHistory: sale4History,
  ),
];

const standardProductionTime = "10-15 dias úteis";

const stockItems = [
  /////////////////////////////////////////////////////////////////////// Placas
  StockItem(
    id: 'placa-est-120x240x10',
    name: 'Placa Cimentícia Estrutural (1.20m x 2.40m x 10mm)',
    unit: 'unidades',
    quantityInStock: 150,
    lowStockThreshold: 30,
    category: 'Placas Cimentícias',
    lastEntryDate: '2024-03-01',
  ),
  StockItem(
    id: 'placa-std-100x240x10',
    name: 'Placa Cimentícia Standard (1.00m x 2.40m x 10mm)',
    unit: 'unidades',
    quantityInStock: 80,
    lowStockThreshold: 20,
    category: 'Placas Cimentícias',
    lastEntryDate: '2024-03-01',
  ),
  StockItem(
    id: 'placa-ref-130x250x12',
    name: 'Placa Cimentícia Reforçada (1.30m x 2.50m x 12mm)',
    unit: 'unidades',
    quantityInStock: 50,
    lowStockThreshold: 10,
    category: 'Placas Cimentícias',
    lastEntryDate: '2024-02-15',
  ),
  StockItem(
    id: 'placa-comp-090x240x10',
    name: 'Placa Cimentícia Compacta (0.90m x 2.40m x 10mm)',
    unit: 'unidades',
    quantityInStock: 60,
    lowStockThreshold: 15,
    category: 'Placas Cimentícias',
    lastEntryDate: '2024-02-15',
  ),
  StockItem(
    id: 'placa-hidro-120x240x12',
    name: 'Placa Cimentícia Hidrofugada (1.20m x 2.40m x 12mm)',
    unit: 'unidades',
    quantityInStock: 40,
    lowStockThreshold: 10,
    category: 'Placas Cimentícias',
  ),
  StockItem(
    id: 'placa-deco-120x240x8',
    name: 'Placa Cimentícia Decorativa (1.20m x 2.40m x 8mm)',
    unit: 'unidades',
    quantityInStock: 30,
    lowStockThreshold: 5,
    category: 'Placas Cimentícias',
  ),
  StockItem(
    id: 'placa-alta-perf-120x240x12',
    name: 'Placa Cimentícia Alta Performance (1.20m x 2.40m x 12mm)',
    unit: 'unidades',
    quantityInStock: 35,
    lowStockThreshold: 10,
    category: 'Placas Cimentícias',
  ),
  StockItem(
    id: 'placa-superboard-120x240x10',
    name: 'Placa Cimentícia Superboard (1.20m x 2.40m x 10mm)',
    unit: 'unidades',
    quantityInStock: 45,
    lowStockThreshold: 10,
    category: 'Placas Cimentícias',
  ),
  StockItem(
    id: 'placa-slim-100x200x8',
    name: 'Placa Cimentícia Slim (1.00m x 2.00m x 8mm)',
    unit: 'unidades',
    quantityInStock: 25,
    lowStockThreshold: 5,
    category: 'Placas Cimentícias',
  ),
  StockItem(
    id: 'placa-texturizada-120x240x10',
    name: 'Placa Cimentícia Texturizada (1.20m x 2.40m x 10mm)',
    unit: 'unidades',
    quantityInStock: 20,
    lowStockThreshold: 5,
    category: 'Placas Cimentícias',
  ),

  /////////////////////////////////////////////////////////////////////// Perfis
  StockItem(
    id: 'perfil-montante-90mm',
    name: 'Perfil de aço galvanizado (montante 90mm)',
    unit: 'metros',
    quantityInStock: 1200,
    lowStockThreshold: 200,
    category: 'Perfis Metálicos',
    lastEntryDate: '2024-03-05',
  ),
  StockItem(
    id: 'perfil-guia-90mm',
    name: 'Perfil de aço galvanizado (guia 90mm)',
    unit: 'metros',
    quantityInStock: 500,
    lowStockThreshold: 100,
    category: 'Perfis Metálicos',
    lastEntryDate: '2024-03-05',
  ),
  StockItem(
    id: 'perfil-montante-100mm',
    name: 'Perfil de aço galvanizado (montante 100mm)',
    unit: 'metros',
    quantityInStock: 800,
    lowStockThreshold: 150,
    category: 'Perfis Metálicos',
  ),
  StockItem(
    id: 'perfil-guia-100mm',
    name: 'Perfil de aço galvanizado (guia 100mm)',
    unit: 'metros',
    quantityInStock: 400,
    lowStockThreshold: 80,
    category: 'Perfis Metálicos',
  ),

  ////////////////////////////////////////////////////// Fixadores e Acabamentos
  StockItem(
    id: 'parafuso-autobrocante',
    name: 'Parafuso autobrocante para aço',
    unit: 'caixas (1000 un)',
    quantityInStock: 10,
    lowStockThreshold: 2,
    category: 'Fixadores',
    lastEntryDate: '2024-02-20',
  ),
  StockItem(
    id: 'fita-junta',
    name: 'Fita de junta para placas cimentícias',
    unit: 'rolos (50m)',
    quantityInStock: 30,
    lowStockThreshold: 5,
    category: 'Acabamentos',
    lastEntryDate: '2024-02-20',
  ),
  StockItem(
    id: 'massa-junta',
    name: 'Massa para tratamento de juntas (placas cimentícias)',
    unit: 'baldes (20kg)',
    quantityInStock: 20,
    lowStockThreshold: 4,
    category: 'Acabamentos',
    lastEntryDate: '2024-02-20',
  ),
  StockItem(
    id: 'la-pet-isolamento',
    name: 'Lã de PET para isolamento termoacústico (50mm)',
    unit: 'm²',
    quantityInStock: 10,
    lowStockThreshold: 50,
    category: 'Isolamento',
  ), // Estoque baixo para teste
  StockItem(
    id: 'barreira-vapor',
    name: 'Barreira de vapor (membrana hidrófuga)',
    unit: 'm²',
    quantityInStock: 150,
    lowStockThreshold: 30,
    category: 'Isolamento',
  ),

  //////////////////////////////////////////////////////////////////// Cobertura
  StockItem(
    id: 'telha-fibrocimento',
    name: 'Telha de fibrocimento ondulada (6mm espessura, 2.44m x 1.10m)',
    unit: 'unidades',
    quantityInStock: 100,
    lowStockThreshold: 20,
    category: 'Cobertura',
    lastEntryDate: '2024-01-10',
  ),
  StockItem(
    id: 'telha-termoacustica-eps30',
    name: 'Telha termoacústica (tipo sanduíche, EPS 30mm)',
    unit: 'm²',
    quantityInStock: 40,
    lowStockThreshold: 50,
    category: 'Cobertura',
  ),

  ///////////////////////////////////////////////////// Estoque baixo para teste
  StockItem(
    id: 'telha-shingle-kit',
    name: 'Kit Telha Shingle (inclui base, telhas, fixadores)',
    unit: 'm²',
    quantityInStock: 150,
    lowStockThreshold: 30,
    category: 'Cobertura',
  ),

  ////////////////////////////////////////////////////////////////// Instalações
  StockItem(
    id: 'kit-eletrico-basico',
    name: 'Kit Elétrico Básico (fios, disjuntores, tomadas)',
    unit: 'kits',
    quantityInStock: 15,
    lowStockThreshold: 3,
    category: 'Instalações',
    lastEntryDate: '2024-01-15',
  ),
  StockItem(
    id: 'kit-hidraulico-basico',
    name: 'Kit Hidráulico Básico (tubos PVC, conexões, caixa 500L)',
    unit: 'kits',
    quantityInStock: 12,
    lowStockThreshold: 3,
    category: 'Instalações',
    lastEntryDate: '2024-01-15',
  ),
  StockItem(
    id: 'kit-hidraulico-750l',
    name: 'Kit Hidráulico (tubos PVC/PEX, conexões, caixa 750L)',
    unit: 'kits',
    quantityInStock: 10,
    lowStockThreshold: 2,
    category: 'Instalações',
  ),
  StockItem(
    id: 'kit-eletrico-completo',
    name: 'Kit Elétrico Completo (DR/DPS, fiação, ar cond.)',
    unit: 'kits',
    quantityInStock: 8,
    lowStockThreshold: 2,
    category: 'Instalações',
  ),
  StockItem(
    id: 'kit-hidraulico-1000l-pex',
    name: 'Kit Hidráulico PEX (água fria/quente, caixa 1000L)',
    unit: 'kits',
    quantityInStock: 7,
    lowStockThreshold: 2,
    category: 'Instalações',
  ),

  ///////////////////////////////////////////////////////////////////// Fundação
  StockItem(
    id: 'concreto-radier-25mpa',
    name: 'Concreto usinado para radier (25 MPA)',
    unit: 'm³',
    quantityInStock: 50,
    lowStockThreshold: 10,
    category: 'Fundação',
    lastEntryDate: '2024-03-10',
  ),
  StockItem(
    id: 'malha-aco-q61',
    name: 'Malha de aço (Q61 - 15x15cm)',
    unit: 'm²',
    quantityInStock: 300,
    lowStockThreshold: 50,
    category: 'Fundação',
    lastEntryDate: '2024-03-10',
  ),
  StockItem(
    id: 'malha-aco-q75',
    name: 'Malha de aço (Q75 - 10x10cm)',
    unit: 'm²',
    quantityInStock: 200,
    lowStockThreshold: 40,
    category: 'Fundação',
  ),

  //////////////////////////////////////////////////////// Esquadrias (Exemplos)
  StockItem(
    id: 'janela-aluminio-120x100',
    name: 'Janela de alumínio branco (1.20m x 1.00m)',
    unit: 'unidades',
    quantityInStock: 30,
    lowStockThreshold: 5,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'janela-aluminio-060x060',
    name: 'Janela de alumínio branco (0.60m x 0.60m - banheiro)',
    unit: 'unidades',
    quantityInStock: 20,
    lowStockThreshold: 4,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'porta-externa-aco',
    name: 'Porta externa de aço (0.80m x 2.10m)',
    unit: 'unidades',
    quantityInStock: 15,
    lowStockThreshold: 3,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'porta-interna-hdf',
    name: 'Porta interna de madeira HDF (0.70m x 2.10m)',
    unit: 'unidades',
    quantityInStock: 40,
    lowStockThreshold: 8,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'janela-aluminio-150x100',
    name: 'Janela de alumínio branco (1.50m x 1.00m)',
    unit: 'unidades',
    quantityInStock: 25,
    lowStockThreshold: 5,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'janela-aluminio-100x100',
    name: 'Janela de alumínio branco (1.00m x 1.00m)',
    unit: 'unidades',
    quantityInStock: 15,
    lowStockThreshold: 3,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'porta-externa-aluminio',
    name: 'Porta externa de alumínio (0.90m x 2.10m)',
    unit: 'unidades',
    quantityInStock: 10,
    lowStockThreshold: 2,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'porta-interna-hdf-080',
    name: 'Porta interna de madeira HDF (0.80m x 2.10m)',
    unit: 'unidades',
    quantityInStock: 30,
    lowStockThreshold: 6,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'janela-pvc-150x120',
    name: 'Janela de PVC com vidro duplo (1.50m x 1.20m)',
    unit: 'unidades',
    quantityInStock: 20,
    lowStockThreshold: 4,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'janela-pvc-080x080',
    name: 'Janela de PVC com vidro duplo (0.80m x 0.80m - cozinha)',
    unit: 'unidades',
    quantityInStock: 10,
    lowStockThreshold: 2,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'janela-pvc-060x060',
    name: 'Janela de PVC com vidro duplo (0.60m x 0.60m - banheiro)',
    unit: 'unidades',
    quantityInStock: 12,
    lowStockThreshold: 3,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'porta-externa-pivotante',
    name: 'Porta externa pivotante de madeira (1.00m x 2.10m)',
    unit: 'unidades',
    quantityInStock: 8,
    lowStockThreshold: 2,
    category: 'Esquadrias',
  ),
  StockItem(
    id: 'porta-interna-laqueada',
    name: 'Porta interna de madeira laqueada (0.80m x 2.10m)',
    unit: 'unidades',
    quantityInStock: 20,
    lowStockThreshold: 4,
    category: 'Esquadrias',
  ),
];
