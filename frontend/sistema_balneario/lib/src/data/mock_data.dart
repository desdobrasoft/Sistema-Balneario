import 'package:sistema_balneario/src/models/customer.dart';
import 'package:sistema_balneario/src/models/delivery_time_stats.dart';
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/models/production_status_distribution.dart';

final customers = [
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

final deliveryTimeStats = [
  DeliveryTimeStats(count: 18, range: '10-12 dias'),
  DeliveryTimeStats(count: 22, range: '13-15 dias'),
  DeliveryTimeStats(count: 5, range: '>15 dias (Atraso Leve)'),
  DeliveryTimeStats(count: 2, range: 'Atrasadas (>5 dias)'),
];

final monthlySales = [
  MonthlySales(month: 'Jan', sales: 120000),
  MonthlySales(month: 'Fev', sales: 180000),
  MonthlySales(month: 'Mar', sales: 150000),
  MonthlySales(month: 'Abr', sales: 210000),
  MonthlySales(month: 'Mai', sales: 160000),
  MonthlySales(month: 'Jun', sales: 250000),
];

final productionStatusDistribution = [
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
