import 'dart:math' show max;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:from_css_color/from_css_color.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapxs, gapmd;
import 'package:tech_wall/src/models/monthly_sales.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/legible_color.dart';

class MonthlyOverview extends StatelessWidget {
  const MonthlyOverview({super.key, required this.data});

  final List<MonthlySales> data;

  static const _step = 5;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return AppCard(
        title: localization(context).dashboardMonthlyOverviewCardTitle,
        subtitle: localization(context).dashboardMonthlyOverviewCardSubtitle,
        content: const Center(child: Text('Nenhuma venda realizada.')),
      );
    }

    final dataMax = data.map((item) => item.sales).reduce(max);
    // Pequeno adicional para descolar a maior barra do topo.
    final maxY = dataMax * 1.1;
    final interval = maxY / _step;

    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    return AppCard(
      title: localization(context).dashboardMonthlyOverviewCardTitle,
      subtitle: localization(context).dashboardMonthlyOverviewCardSubtitle,
      content: LayoutBuilder(
        builder: (context, constraints) {
          return Container(
            height: MediaQuery.of(context).size.height * 0.4,
            padding: EdgeInsets.only(top: gapmd),
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
                          top: Radius.circular(gapxs),
                        ),
                        color: legibleColor(
                          backgroundColor: scheme.surfaceContainerLow,
                          foregroundColor: fromCssColor(data[i].fill),
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
