import 'package:sistema_balneario/src/models/delivery_time_stats.dart';
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/models/production_status_distribution.dart';

class MockData {
  const MockData._();

  static final deliveryTimeStats = [
    DeliveryTimeStats(count: 18, range: '10-12 dias'),
    DeliveryTimeStats(count: 22, range: '13-15 dias'),
    DeliveryTimeStats(count: 5, range: '>15 dias (Atraso Leve)'),
    DeliveryTimeStats(count: 2, range: 'Atrasadas (>5 dias)'),
  ];

  static final monthlySales = [
    MonthlySales(month: 'Jan', sales: 120000),
    MonthlySales(month: 'Fev', sales: 180000),
    MonthlySales(month: 'Mar', sales: 150000),
    MonthlySales(month: 'Abr', sales: 210000),
    MonthlySales(month: 'Mai', sales: 160000),
    MonthlySales(month: 'Jun', sales: 250000),
  ];

  static final productionStatusDistribution = [
    ProductionStatusDistribution(
      count: 5,
      fill: 'hsl(var(--chart-1))',
      status: 'Agendados',
    ),
    ProductionStatusDistribution(
      count: 12,
      fill: 'hsl(var(--chart-2))',
      status: 'Em Progresso',
    ),
    ProductionStatusDistribution(
      count: 25,
      fill: 'hsl(var(--chart-3))',
      status: 'Concluídos',
    ),
    ProductionStatusDistribution(
      count: 2,
      fill: 'hsl(var(--chart-4))',
      status: 'Em Espera',
    ),
  ];
}
