import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show gaplg;

enum _Variant { basic, filled, outlined }

class AppCard extends StatefulWidget {
  final _Variant _variant;

  final Widget? image;
  final String? title;
  final String? subtitle;
  final Widget? content;

  const AppCard({
    super.key,
    this.image,
    this.title,
    this.subtitle,
    this.content,
  }) : _variant = _Variant.basic;

  const AppCard.filled({
    super.key,
    this.image,
    this.title,
    this.subtitle,
    this.content,
  }) : _variant = _Variant.filled;

  const AppCard.outlined({
    super.key,
    this.image,
    this.title,
    this.subtitle,
    this.content,
  }) : _variant = _Variant.outlined;

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  @override
  Widget build(BuildContext context) {
    final styles = TextTheme.of(context);

    final child = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.max,
      children: [
        if (widget.image != null)
          ClipRRect(
            borderRadius: BorderRadiusGeometry.vertical(
              top: Radius.circular(12),
            ),
            child: widget.image!,
          ),
        Flexible(
          child: Padding(
            padding: EdgeInsets.all(gaplg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              mainAxisSize: MainAxisSize.max,
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
        ),
      ],
    );

    return switch (widget._variant) {
      _Variant.basic => Card(margin: EdgeInsets.zero, child: child),
      _Variant.filled => Card.filled(margin: EdgeInsets.zero, child: child),
      _Variant.outlined => Card.outlined(margin: EdgeInsets.zero, child: child),
    };
  }
}
