import 'package:auto_size_text/auto_size_text.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/components/responsive_grid.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:casa_facil/src/enums/window_class.dart';
import 'package:casa_facil/src/models/lancamento.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FinanceDashboard extends StatefulWidget {
  const FinanceDashboard({super.key, required this.data});

  final List<LancamentoModel> data;

  @override
  State<FinanceDashboard> createState() => _FinanceDashboardState();
}

class _FinanceDashboardState extends State<FinanceDashboard> {
  static const _cardHeight = 100.0;

  @override
  Widget build(BuildContext context) {
    final windowClass = WindowClass.fromWidth(
      MediaQuery.of(context).size.width,
    );
    final count = switch (windowClass) {
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

    // Total Recebido: Soma do que foi efetivamente pago (valor total - valor pendente) nas receitas.
    final totalRecebido = widget.data
        .where((entry) => entry.tipo == TipoLancamento.receita)
        .map((e) => e.valorTotal - e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    // Total Pago: Soma do que foi efetivamente pago (valor total - valor pendente) nas despesas.
    final totalPago = widget.data
        .where((entry) => entry.tipo == TipoLancamento.despesa)
        .map((e) => e.valorTotal - e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    // A Receber: Soma de todos os valores pendentes das receitas.
    final aReceber = widget.data
        .where((entry) => entry.tipo == TipoLancamento.receita)
        .map((e) => e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    // A Pagar: Soma de todos os valores pendentes das despesas.
    final aPagar = widget.data
        .where((entry) => entry.tipo == TipoLancamento.despesa)
        .map((e) => e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

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
                    Icon(Icons.trending_up, color: Colors.green),
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
                    Icon(Icons.trending_down, color: Colors.red),
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
                    Icon(Icons.arrow_circle_down_outlined, color: Colors.blue),
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
                    Icon(Icons.arrow_circle_up_outlined, color: Colors.orange),
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
