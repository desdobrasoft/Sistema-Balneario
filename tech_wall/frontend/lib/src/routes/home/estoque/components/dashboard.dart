import 'dart:math' show pi;

import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/responsive_grid.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/enums/window_class.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class InventoryDashboard extends StatefulWidget {
  const InventoryDashboard({super.key, required this.data});

  final List<MaterialEstoqueModel> data;

  @override
  State<InventoryDashboard> createState() => InventoryDashboardState();
}

class InventoryDashboardState extends State<InventoryDashboard> {
  static const _cardHeight = 130.0;

  WindowClass _windowClass = WindowClass.expanded;

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

    final itensDistintos = widget.data.length;

    final estoqueBaixo = widget.data
        .where((item) => item.quantidade < item.limBaixoEstoque)
        .length;

    final entryDates = widget.data
        .map((item) => DateTime.tryParse('${item.ultimaEntrada}'))
        .where((date) => date != null)
        .toList();
    entryDates.sort();
    final ultimaEntrada = entryDates.lastOrNull;

    final exitDates = widget.data
        .map((item) => DateTime.tryParse('${item.ultimaSaida}'))
        .where((date) => date != null)
        .toList();
    exitDates.sort();
    final ultimaSaida = exitDates.lastOrNull;

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
                      child: Text('Itens distintos', style: styles.titleMedium),
                    ),
                    Icon(Icons.inventory_2_outlined),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    itensDistintos.toString(),
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
                      child: AutoSizeText(
                        'Itens com estoque baixo',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: styles.titleMedium,
                      ),
                    ),
                    Icon(Icons.error_outline, color: Colors.yellow),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Align(
                      alignment: Alignment.bottomLeft,
                      child: AutoSizeText(
                        estoqueBaixo.toString(),
                        maxLines: 1,
                        minFontSize: styles.titleLarge?.fontSize ?? 12,
                        overflow: TextOverflow.ellipsis,
                        style: styles.headlineLarge?.copyWith(
                          color: scheme.primary,
                        ),
                      ),
                    ),
                    AutoSizeText(
                      'Abaixo do limite mínimo definido',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
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
                      child: Text('Última entrada', style: styles.titleMedium),
                    ),
                    Transform.rotate(
                      angle: pi / 2,
                      child: Icon(Symbols.place_item),
                    ),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    ultimaEntrada == null
                        ? 'N/A'
                        : DateFormat.yMd(
                            localization(context).localeName,
                          ).format(ultimaEntrada),
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
                      child: Text('Última saída', style: styles.titleMedium),
                    ),
                    Icon(Symbols.move_item),
                  ],
                ),
                Align(
                  alignment: Alignment.bottomLeft,
                  child: AutoSizeText(
                    ultimaSaida == null
                        ? 'N/A'
                        : DateFormat.yMd(
                            localization(context).localeName,
                          ).format(ultimaSaida),
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
