import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show px16;

class AppCard extends StatefulWidget {
  const AppCard({super.key, this.title, this.subtitle, this.content});

  final String? title;
  final String? subtitle;
  final Widget? content;

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  @override
  Widget build(BuildContext context) {
    final styles = TextTheme.of(context);

    return Card(
      child: Padding(
        padding: EdgeInsets.all(px16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          mainAxisSize: MainAxisSize.min,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.title != null)
                  AutoSizeText(
                    widget.title!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: styles.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                if (widget.subtitle != null)
                  AutoSizeText(
                    widget.subtitle!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: styles.titleSmall?.copyWith(
                      fontWeight: FontWeight.w200,
                    ),
                  ),
              ],
            ),
            if (widget.content != null) Flexible(child: widget.content!),
          ],
        ),
      ),
    );
  }
}
