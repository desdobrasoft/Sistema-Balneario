import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/dashboard/dashboard.dart';
import 'package:tech_wall/src/api/producao/producao.dart';
import 'package:tech_wall/src/api/vendas/vendas.dart';
import 'package:tech_wall/src/components/responsive_grid.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapxl, gapxxl;
import 'package:tech_wall/src/enums/window_class.dart';
import 'package:tech_wall/src/models/delivery_time_stats.dart';
import 'package:tech_wall/src/models/monthly_sales.dart';
import 'package:tech_wall/src/models/ordem_producao.dart';
import 'package:tech_wall/src/models/production_status_distribution.dart';
import 'package:tech_wall/src/models/status_producao.dart';
import 'package:tech_wall/src/models/status_venda.dart';
import 'package:tech_wall/src/models/venda.dart';
import 'package:tech_wall/src/routes/home/dashboard/components/active_prods.dart';
import 'package:tech_wall/src/routes/home/dashboard/components/avg_delivery_time.dart';
import 'package:tech_wall/src/routes/home/dashboard/components/delivery_time_analysis.dart';
import 'package:tech_wall/src/routes/home/dashboard/components/monthly_overview.dart';
import 'package:tech_wall/src/routes/home/dashboard/components/prod_status.dart';
import 'package:tech_wall/src/routes/home/dashboard/components/total_sales.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  static const double _basicCardHeight = 180;
  static const double _chartCardHeight = 430;

  // Variáveis de estado para os dados processados
  bool _isLoading = true;
  double _totalSalesValue = 0.0;
  int _activeProdsCount = 0;
  List<MonthlySales> _monthlySalesData = [];
  List<ProductionStatusDistribution> _prodStatusData = [];
  String _avgDeliveryTime = 'N/A';
  List<DeliveryTimeStats> _deliveryStats = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchAndProcessData());
  }

  Future<void> _fetchAndProcessData() async {
    setState(() => _isLoading = true);

    // Busca os dados brutos das APIs em paralelo
    final responses = await Future.wait([
      VendasApi.listAll(excludeStatus: StatusVenda.canceled.prisma),
      ProducaoApi.listAll(),
      DashboardApi.getAvgDeliveryTime(),
      DashboardApi.getDeliveryTimeAnalysis(),
    ]);

    final vendas = responses[0] as List<VendaModel>;
    final ordensProducao = responses[1] as List<OrdemProducaoModel>;
    final avgDeliveryTime = responses[2] as Map<String, dynamic>;
    final deliveryAnalysis = responses[3] as Map<String, dynamic>;

    // Processa os dados brutos e atualiza o estado
    setState(() {
      _totalSalesValue = _calculateTotalSales(vendas);
      _activeProdsCount = _calculateActiveProds(ordensProducao);
      _monthlySalesData = _processMonthlyOverview(vendas);
      _prodStatusData = _processProdStatus(ordensProducao);
      _avgDeliveryTime = _processAvgDeliveryTime(avgDeliveryTime);
      _deliveryStats = _processDeliveryTimeAnalysis(deliveryAnalysis);
      _isLoading = false;
    });
  }

  String _processAvgDeliveryTime(Map<String, dynamic> data) {
    final days = data['avgDays'] as int? ?? 0;
    return '$days Dias';
  }

  List<DeliveryTimeStats> _processDeliveryTimeAnalysis(
    Map<String, dynamic> data,
  ) {
    if (data.isEmpty) return [];

    return [
      DeliveryTimeStats(
        range: 'Adiantadas',
        count: data['early'] as int? ?? 0,
        fill: '#00C49F', // Verde
      ),
      DeliveryTimeStats(
        range: 'Em Dia',
        count: data['onTime'] as int? ?? 0,
        fill: '#0088FE', // Azul
      ),
      DeliveryTimeStats(
        range: 'Leve Atraso',
        count: data['slightlyLate'] as int? ?? 0,
        fill: '#FFBB28', // Amarelo
      ),
      DeliveryTimeStats(
        range: 'Atrasadas',
        count: data['late'] as int? ?? 0,
        fill: '#FF0000', // Vermelho
      ),
    ];
  }

  double _calculateTotalSales(List<VendaModel> vendas) {
    if (vendas.isEmpty) return 0.0;
    return vendas.map((v) => v.preco).fold(0.0, (sum, preco) => sum + preco);
  }

  int _calculateActiveProds(List<OrdemProducaoModel> ordens) {
    // Considera "ativas" todas que não estão em um estado final
    final finalStates = [StatusProducao.prontoEnvio, StatusProducao.cancelado];
    return ordens.where((o) => !finalStates.contains(o.status)).length;
  }

  List<MonthlySales> _processMonthlyOverview(List<VendaModel> vendas) {
    if (vendas.isEmpty) return [];

    final Map<String, double> salesByMonth = {};
    final monthFormat = DateFormat('yyyy-MM'); // Para agrupar por ano/mês
    final labelFormat = DateFormat('MMM/yy'); // Para exibir (ex: Jul/25)

    for (final venda in vendas) {
      final date = DateTime.tryParse(venda.dataVenda);
      if (date == null) continue;

      final monthKey = monthFormat.format(date);
      salesByMonth.update(
        monthKey,
        (value) => value + venda.preco,
        ifAbsent: () => venda.preco,
      );
    }

    // Converte o mapa para a lista que o gráfico espera
    return salesByMonth.entries
        .map(
          (entry) => MonthlySales(
            month: labelFormat.format(monthFormat.parse(entry.key)),
            sales: entry.value,
            fill: '#8884d8', // Cor padrão
          ),
        )
        .toList()
      ..sort((a, b) => a.month.compareTo(b.month));
  }

  List<ProductionStatusDistribution> _processProdStatus(
    List<OrdemProducaoModel> ordens,
  ) {
    if (ordens.isEmpty) return [];

    final Map<StatusProducao, int> statusCount = {};
    for (final ordem in ordens) {
      statusCount.update(ordem.status, (value) => value + 1, ifAbsent: () => 1);
    }

    // Mapeia o enum para a cor (você pode customizar)
    final colors = {
      StatusProducao.agendado: '#0088FE',
      StatusProducao.materiaisPendentes: '#FFBB28',
      StatusProducao.preparando: '#00C49F',
      StatusProducao.montando: '#FF8042',
      StatusProducao.prontoEnvio: '#A2E8A5',
      StatusProducao.emEspera: '#FF4136',
      StatusProducao.cancelado: '#FF0000',
    };

    return statusCount.entries
        .map(
          (entry) => ProductionStatusDistribution(
            status: entry.key.description,
            count: entry.value,
            fill: colors[entry.key] ?? '#CCCCCC',
          ),
        )
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final windowClass = WindowClass.fromWidth(
      MediaQuery.of(context).size.width,
    );
    final basicCount = switch (windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 2,
      WindowClass.expanded => 3,
    };

    final chartCount = switch (windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 1,
      WindowClass.expanded => 2,
    };

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: gapxl,
            children: [
              ResponsiveGrid(
                crossAxisCount: basicCount,
                runSpacing: gapxl,
                spacing: gapxl,
                children: [
                  SizedBox(
                    height: _basicCardHeight,
                    child: TotalSales(sales: _totalSalesValue),
                  ),
                  SizedBox(
                    height: _basicCardHeight,
                    child: ActiveProds(activeProds: _activeProdsCount),
                  ),
                  SizedBox(
                    height: _basicCardHeight,
                    child: AvgDeliveryTime(data: _avgDeliveryTime),
                  ),
                ],
              ),
              ResponsiveGrid(
                crossAxisCount: chartCount,
                runSpacing: gapxxl,
                spacing: gapxxl,
                children: [
                  SizedBox(
                    height: _chartCardHeight,
                    child: MonthlyOverview(data: _monthlySalesData),
                  ),
                  SizedBox(
                    height: _chartCardHeight,
                    child: ProdStatus(data: _prodStatusData),
                  ),
                  SizedBox(
                    height: _chartCardHeight,
                    child: DeliveryTimeAnalysis(data: _deliveryStats),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
