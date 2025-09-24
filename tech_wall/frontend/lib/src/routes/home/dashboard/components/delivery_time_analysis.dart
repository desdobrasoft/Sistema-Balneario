import 'dart:math' show max, pi;

import 'package:auto_size_text/auto_size_text.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:from_css_color/from_css_color.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show gapxs, gapsm, gapmd;
import 'package:tech_wall/src/models/delivery_time_stats.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/legible_color.dart';

class DeliveryTimeAnalysis extends StatelessWidget {
  const DeliveryTimeAnalysis({super.key, required this.data});

  final List<DeliveryTimeStats> data;

  static const int _step = 5;
  static const double _sideLabelsSize = 100;

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return AppCard(
        title: localization(context).dashboardDeliveryTimeAnalysisCardTitle,
        subtitle: localization(
          context,
        ).dashboardDeliveryTimeAnalysisCardSubtitle,
        content: const Center(child: Text('Nenhuma entrega agendada.')),
      );
    }

    final dataMax = data.map((item) => item.count).reduce(max);
    // Pequeno adicional para descolar a maior barra do topo.
    final maxY = dataMax * 1.1;
    final interval = maxY / _step;

    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    return AppCard(
      title: localization(context).dashboardDeliveryTimeAnalysisCardTitle,
      subtitle: localization(context).dashboardDeliveryTimeAnalysisCardSubtitle,
      content: Container(
        height: MediaQuery.of(context).size.height * 0.4,
        padding: EdgeInsets.only(top: gapmd),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return BarChart(
              BarChartData(
                rotationQuarterTurns: 1,
                maxY: maxY,
                titlesData: FlTitlesData(
                  show: true,
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      interval: interval,
                      reservedSize: 60,
                      showTitles: true,
                    ),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      reservedSize: _sideLabelsSize,
                      showTitles: true,

                      getTitlesWidget: (value, _) {
                        return Transform.rotate(
                          angle: -pi / 2,
                          child: Container(
                            alignment: Alignment.centerRight,
                            padding: EdgeInsets.only(right: gapsm),
                            width: _sideLabelsSize,
                            child: AutoSizeText(
                              data[value.toInt()].range,
                              style: styles.labelSmall,
                              textAlign: TextAlign.right,
                            ),
                          ),
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
                        toY: data[i].count.toDouble(),
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(gapxs),
                        ),
                        color: legibleColor(
                          backgroundColor: scheme.surfaceContainerLow,
                          foregroundColor: fromCssColor(data[i].fill),
                        ),
                        width: 0.6 * constraints.maxHeight / data.length,
                      ),
                    ],
                  );
                }),
              ),
            );
          },
        ),
      ),
    );
  }
}
