import 'package:auto_size_text/auto_size_text.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';

class ActiveProds extends StatelessWidget {
  const ActiveProds({super.key, this.activeProds = 0});

  final int activeProds;

  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    return AppCard(
      title: localization(context).dashboardActiveProdsCardTitle,
      subtitle: localization(context).dashboardActiveProdsCardSubtitle,
      content: Align(
        alignment: Alignment.bottomLeft,
        child: AutoSizeText(
          '$activeProds',
          maxLines: 1,
          minFontSize: styles.titleLarge?.fontSize ?? 12,
          overflow: TextOverflow.ellipsis,
          style: styles.headlineLarge?.copyWith(color: scheme.primary),
        ),
      ),
    );
  }
}
