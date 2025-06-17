import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';

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
        padding: EdgeInsets.all(AppSizes.gap.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          spacing: AppSizes.gap.xl,
          children: [
            Text.rich(
              TextSpan(
                children: [
                  if (widget.title != null)
                    TextSpan(
                      text: '${widget.title!}\n',
                      style: styles.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  if (widget.subtitle != null)
                    TextSpan(
                      text: widget.subtitle!,
                      style: styles.titleSmall?.copyWith(
                        fontWeight: FontWeight.w200,
                      ),
                    ),
                ],
              ),
            ),
            if (widget.content != null) widget.content!,
          ],
        ),
      ),
    );
  }
}
