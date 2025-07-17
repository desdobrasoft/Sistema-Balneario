import 'package:auto_size_text/auto_size_text.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/components/responsive_grid.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:casa_facil/src/enums/window_class.dart';
import 'package:casa_facil/src/models/account_entry_model.dart';
import 'package:casa_facil/src/models/financial_transaction_type.dart';
import 'package:casa_facil/src/models/status_pagamento.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FinanceDashboard extends StatefulWidget {
  const FinanceDashboard({super.key, required this.data});

  final List<AccountEntryModel> data;

  @override
  State<FinanceDashboard> createState() => _FinanceDashboardState();
}

class _FinanceDashboardState extends State<FinanceDashboard> {
  static const _cardHeight = 100.0;

  WindowClass _windowClass = WindowClass.expanded;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final newWC = WindowClass.fromWidth(MediaQuery.of(context).size.width);
    if (newWC != _windowClass) {
      setState(() => _windowClass = newWC);
    }

    final count = switch (_windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 2,
      WindowClass.expanded => 4,
    };

    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    final currencyFormatter = NumberFormat.currency(
      locale: localization(context).localeName,
      symbol: 'R\$',
    );

    final totalRecebido = widget.data
        .where(
          (entry) =>
              entry.type == FinancialTransactionType.revenue &&
              entry.status == StatusPagamento.paid,
        )
        .map((e) => e.amount)
        .reduce((sum, e) => sum + e);

    final totalPago = widget.data
        .where(
          (entry) =>
              entry.type == FinancialTransactionType.expenses &&
              entry.status == StatusPagamento.paid,
        )
        .map((e) => e.amount)
        .reduce((sum, e) => sum + e);

    final aReceber = widget.data
        .where(
          (entry) =>
              entry.type == FinancialTransactionType.revenue &&
              entry.status == StatusPagamento.pending,
        )
        .map((e) => e.amount)
        .reduce((sum, e) => sum + e);

    final aPagar = widget.data
        .where(
          (entry) =>
              entry.type == FinancialTransactionType.expenses &&
              entry.status == StatusPagamento.pending,
        )
        .map((e) => e.amount)
        .reduce((sum, e) => sum + e);

    return ResponsiveGrid(
      crossAxisCount: count,
      runSpacing: gaplg,
      spacing: gaplg,
      children: [
        AppCard.outlined(
          content: SizedBox(
            height: _cardHeight,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('Total recebido', style: styles.titleMedium),
                    ),
                    Icon(Icons.trending_up),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    currencyFormatter.format(totalRecebido),
                    maxLines: 1,
                    minFontSize: styles.titleLarge?.fontSize ?? 12,
                    overflow: TextOverflow.ellipsis,
                    style: styles.headlineLarge?.copyWith(
                      color: scheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        AppCard.outlined(
          content: SizedBox(
            height: _cardHeight,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('Total pago', style: styles.titleMedium),
                    ),
                    Icon(Icons.trending_down),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    currencyFormatter.format(totalPago),
                    maxLines: 1,
                    minFontSize: styles.titleLarge?.fontSize ?? 12,
                    overflow: TextOverflow.ellipsis,
                    style: styles.headlineLarge?.copyWith(
                      color: scheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        AppCard.outlined(
          content: SizedBox(
            height: _cardHeight,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('A receber', style: styles.titleMedium),
                    ),
                    Icon(Icons.trending_up, color: Colors.yellow),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    currencyFormatter.format(aReceber),
                    maxLines: 1,
                    minFontSize: styles.titleLarge?.fontSize ?? 12,
                    overflow: TextOverflow.ellipsis,
                    style: styles.headlineLarge?.copyWith(
                      color: scheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        AppCard.outlined(
          content: SizedBox(
            height: _cardHeight,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Expanded(child: Text('A pagar', style: styles.titleMedium)),
                    Icon(Icons.trending_down, color: Colors.red),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    currencyFormatter.format(aPagar),
                    maxLines: 1,
                    minFontSize: styles.titleLarge?.fontSize ?? 12,
                    overflow: TextOverflow.ellipsis,
                    style: styles.headlineLarge?.copyWith(
                      color: scheme.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
