import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;

enum _Variant { basic, filled, outlined }

class AppCard extends StatefulWidget {
  final _Variant _variant;

  final List<PopupMenuEntry>? actions;
  final Widget? image;
  final String? title;
  final String? subtitle;
  final Widget? content;
  final VoidCallback? onTap; // Parâmetro adicionado

  const AppCard({
    super.key,
    this.actions,
    this.image,
    this.title,
    this.subtitle,
    this.content,
    this.onTap, // Adicionado ao construtor
  }) : _variant = _Variant.basic;

  const AppCard.filled({
    super.key,
    this.actions,
    this.image,
    this.title,
    this.subtitle,
    this.content,
    this.onTap, // Adicionado ao construtor
  }) : _variant = _Variant.filled;

  const AppCard.outlined({
    super.key,
    this.actions,
    this.image,
    this.title,
    this.subtitle,
    this.content,
    this.onTap, // Adicionado ao construtor
  }) : _variant = _Variant.outlined;

  @override
  State<AppCard> createState() => _AppCardState();
}

class _AppCardState extends State<AppCard> {
  @override
  Widget build(BuildContext context) {
    final styles = TextTheme.of(context);

    final columnChild = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.image != null)
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: widget.image!,
          ),
        Flexible(
          child: Padding(
            padding: const EdgeInsets.all(gaplg),
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

    // Envolve o conteúdo em um InkWell se onTap for fornecido
    final interactiveChild = widget.onTap == null
        ? columnChild
        : InkWell(
            onTap: widget.onTap,
            borderRadius: BorderRadius.circular(
              12,
            ), // Combina com o raio do Card
            child: columnChild,
          );

    return switch (widget._variant) {
      _Variant.basic => Card(
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        child: interactiveChild,
      ),
      _Variant.filled => Card.filled(
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        child: interactiveChild,
      ),
      _Variant.outlined => Card.outlined(
        margin: EdgeInsets.zero,
        clipBehavior: Clip.antiAlias,
        child: interactiveChild,
      ),
    };
  }
}
