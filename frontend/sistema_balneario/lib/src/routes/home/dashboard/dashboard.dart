import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/data/mock_data.dart';
import 'package:sistema_balneario/src/models/monthly_sales.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: localization(context).localeName,
      symbol: 'R\$',
    );
    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: AppSizes.gap.xxl),
          child: Wrap(
            runSpacing: AppSizes.gap.xxl,
            spacing: AppSizes.gap.xxl,
            children: [
              AppCard(
                title: localization(context).dashboardTotalSalesCardTitle,
                subtitle: localization(context).dashboardTotalSalesCardSubtitle,
                content: AutoSizeText(
                  currencyFormatter.format(
                    MockData.monthlySales
                        .reduce(
                          (sum, item) => MonthlySales(
                            month: '',
                            sales: sum.sales + item.sales,
                          ),
                        )
                        .sales,
                  ),
                  maxLines: 1,
                  minFontSize: styles.titleLarge?.fontSize ?? 12,
                  overflow: TextOverflow.ellipsis,
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                  textAlign: TextAlign.right,
                ),
              ),
              AppCard(
                title: localization(context).dashboardActiveProdsCardTitle,
                subtitle: localization(
                  context,
                ).dashboardActiveProdsCardSubtitle,
                content: AutoSizeText(
                  '${MockData.productionStatusDistribution.singleWhere((item) => item.status.toLowerCase() == 'em progresso').count}',
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                  textAlign: TextAlign.right,
                ),
              ),
              AppCard(
                title: localization(context).dashboardAvgDeliveryTimeCardTitle,
                subtitle: localization(
                  context,
                ).dashboardAvgDeliveryTimeCardSubtitle,
                content: AutoSizeText(
                  // TODO: Adicionar ao mock data.
                  '3,5 semanas',
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
