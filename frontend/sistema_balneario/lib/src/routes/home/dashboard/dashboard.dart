import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/responsive_grid.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gapxl, gapxxl;
import 'package:sistema_balneario/src/data/mock_data.dart'
    show monthlySales, productionStatusDistribution, deliveryTimeStats;
import 'package:sistema_balneario/src/enums/window_class.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/components/active_prods.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/components/avg_delivery_time.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/components/delivery_time_analysis.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/components/monthly_overview.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/components/prod_status.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/components/total_sales.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  static const double _basicCardHeight = 180;
  static const double _chartCardHeight = 430;

  WindowClass _windowClass = WindowClass.expanded;

  @override
  Widget build(BuildContext context) {
    final newWC = WindowClass.fromWidth(MediaQuery.of(context).size.width);
    if (newWC != _windowClass) {
      setState(() => _windowClass = newWC);
    }

    final basicCount = switch (_windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 2,
      WindowClass.expanded => 3,
    };

    final chartCount = switch (_windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 1,
      WindowClass.expanded => 2,
    };

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
                    child: TotalSales(
                      sales: monthlySales
                          .map((item) => item.sales)
                          .reduce((sum, item) => sum + item),
                    ),
                  ),
                  SizedBox(
                    height: _basicCardHeight,
                    child: ActiveProds(
                      activeProds: productionStatusDistribution
                          .singleWhere(
                            (item) =>
                                item.status.toLowerCase() == 'em progresso',
                          )
                          .count,
                    ),
                  ),
                  SizedBox(
                    height: _basicCardHeight,
                    child: AvgDeliveryTime(data: '3,5 semanas'),
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
                    child: MonthlyOverview(data: monthlySales),
                  ),
                  SizedBox(
                    height: _chartCardHeight,
                    child: ProdStatus(data: productionStatusDistribution),
                  ),
                  SizedBox(
                    height: _chartCardHeight,
                    child: DeliveryTimeAnalysis(data: deliveryTimeStats),
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
