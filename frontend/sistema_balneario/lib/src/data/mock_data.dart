import 'package:sistema_balneario/src/models/delivery_time_stats.dart';
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/models/production_status_distribution.dart';

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
