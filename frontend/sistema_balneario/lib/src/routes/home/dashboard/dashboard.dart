import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show px24;
import 'package:sistema_balneario/src/data/mock_data.dart'
    show monthlySales, productionStatusDistribution, deliveryTimeStats;
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
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.all(px24).copyWith(top: 0),
          child: Wrap(
            runSpacing: px24,
            spacing: px24,
            children: [
              TotalSales(
                sales: monthlySales
                    .map((item) => item.sales)
                    .reduce((sum, item) => sum + item),
              ),
              ActiveProds(
                activeProds: productionStatusDistribution
                    .singleWhere(
                      (item) => item.status.toLowerCase() == 'em progresso',
                    )
                    .count,
              ),
              AvgDeliveryTime(data: '3,5 semanas'),
              MonthlyOverview(data: monthlySales),
              ProdStatus(data: productionStatusDistribution),
              DeliveryTimeAnalysis(data: deliveryTimeStats),
            ],
          ),
        ),
      ),
    );
  }
}
