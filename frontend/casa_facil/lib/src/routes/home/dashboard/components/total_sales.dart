import 'package:auto_size_text/auto_size_text.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart' show NumberFormat;

class TotalSales extends StatelessWidget {
  const TotalSales({super.key, this.sales = 0});

  final double sales;

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: localization(context).localeName,
      symbol: 'R\$',
    );
    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    return AppCard(
      title: localization(context).dashboardTotalSalesCardTitle,
      subtitle: localization(context).dashboardTotalSalesCardSubtitle,
      content: Align(
        alignment: Alignment.bottomLeft,
        child: AutoSizeText(
          currencyFormatter.format(sales),
          maxLines: 1,
          minFontSize: styles.titleLarge?.fontSize ?? 12,
          overflow: TextOverflow.ellipsis,
          style: styles.headlineLarge?.copyWith(color: scheme.primary),
        ),
      ),
    );
  }
}
