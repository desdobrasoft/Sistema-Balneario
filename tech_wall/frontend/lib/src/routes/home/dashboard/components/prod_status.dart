import 'dart:math' show min;

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:from_css_color/from_css_color.dart' show fromCssColor;
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapmd;
import 'package:tech_wall/src/models/production_status_distribution.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/legible_color.dart';

class ProdStatus extends StatefulWidget {
  const ProdStatus({super.key, required this.data});

  final List<ProductionStatusDistribution> data;

  @override
  State<ProdStatus> createState() => _ProdStatusState();
}

class _ProdStatusState extends State<ProdStatus> {
  int _index = -1;

  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    if (widget.data.isEmpty) {
      return AppCard(
        title: localization(context).dashboardProdStatusCardTitle,
        subtitle: localization(context).dashboardProdStatusCardSubtitle,
        content: const Center(child: Text('Nenhuma ordem de produção gerada.')),
      );
    }

    return AppCard(
      title: localization(context).dashboardProdStatusCardTitle,
      subtitle: localization(context).dashboardProdStatusCardSubtitle,
      content: Container(
        height: MediaQuery.of(context).size.height * 0.4,
        padding: EdgeInsets.only(top: gapmd),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return PieChart(
              curve: Curves.fastOutSlowIn,
              duration: Durations.short1,
              PieChartData(
                centerSpaceRadius: 0,

                pieTouchData: PieTouchData(
                  touchCallback: (event, response) {
                    setState(() {
                      if (!event.isInterestedForInteractions ||
                          response == null ||
                          response.touchedSection == null) {
                        _index = -1;
                        return;
                      }

                      _index = response.touchedSection!.touchedSectionIndex;
                    });
                  },
                ),

                sections: List.generate(widget.data.length, (i) {
                  final item = widget.data[i];

                  return PieChartSectionData(
                    badgePositionPercentageOffset: 1.1,
                    color: fromCssColor(item.fill),
                    radius:
                        min(constraints.maxHeight, constraints.maxWidth) /
                        2 *
                        (_index == i ? 0.8 : 0.75),
                    showTitle: false,
                    value: item.count.toDouble(),

                    badgeWidget: Text(
                      '${item.count}',
                      style: styles.labelSmall?.copyWith(
                        color: legibleColor(
                          backgroundColor: scheme.surfaceContainerLow,
                          foregroundColor: fromCssColor(item.fill),
                        ),
                      ),
                    ),
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
