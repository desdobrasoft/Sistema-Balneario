import 'package:auto_size_text/auto_size_text.dart';
import 'package:casa_facil/src/constants/constants.dart' show gaplg;
import 'package:flutter/material.dart';

enum _Variant { basic, filled, outlined }

class AppCard extends StatefulWidget {
  final _Variant _variant;

  final List<PopupMenuEntry>? actions;
  final Widget? image;
  final String? title;
  final String? subtitle;
  final Widget? content;

  const AppCard({
    super.key,
    this.actions,
    this.image,
    this.title,
    this.subtitle,
    this.content,
  }) : _variant = _Variant.basic;

  const AppCard.filled({
    super.key,
    this.actions,
    this.image,
    this.title,
    this.subtitle,
    this.content,
  }) : _variant = _Variant.filled;

  const AppCard.outlined({
    super.key,
    this.actions,
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
      mainAxisSize: MainAxisSize.min,
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
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
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
                              maxLines: 3,
                              overflow: TextOverflow.ellipsis,
                              style: styles.titleSmall?.copyWith(
                                fontWeight: FontWeight.w200,
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (widget.actions != null)
                      PopupMenuButton(
                        itemBuilder: (context) => widget.actions!,
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
