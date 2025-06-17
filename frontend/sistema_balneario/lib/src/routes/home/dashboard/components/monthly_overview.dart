import 'dart:math' show max;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show px4;
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class MonthlyOverview extends StatelessWidget {
  const MonthlyOverview({super.key, required this.data});

  final List<MonthlySales> data;

  static const _step = 5;

  @override
  Widget build(BuildContext context) {
    final dataMax = data.map((item) => item.sales).reduce(max);
    // Pequeno adicional para descolar a maior barra do topo.
    final maxY = dataMax * 1.1;
    final interval = maxY / _step;

    final styles = TextTheme.of(context);

    return AppCard(
      title: localization(context).dashboardMonthlyOverviewCardTitle,
      subtitle: localization(context).dashboardMonthlyOverviewCardSubtitle,
      content: LayoutBuilder(
        builder: (context, constraints) {
          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.4,
            child: BarChart(
              BarChartData(
                maxY: maxY,
                titlesData: FlTitlesData(
                  show: true,
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      interval: interval,
                      reservedSize: 60,
                      showTitles: true,

                      getTitlesWidget: (value, meta) {
                        final text = 'R\$ ${(value / 1000).round()}K';

                        return Text(text, style: styles.labelSmall);
                      },
                    ),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,

                      getTitlesWidget: (value, _) {
                        return Text(
                          data[value.toInt()].month,
                          style: styles.labelSmall,
                        );
                      },
                    ),
                  ),
                  rightTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                ),

                barGroups: List.generate(data.length, (i) {
                  return BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: data[i].sales,
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(px4),
                        ),
                        width: 0.6 * constraints.maxWidth / data.length,
                      ),
                    ],
                  );
                }),
              ),
            ),
          );
        },
      ),
    );
  }
}
