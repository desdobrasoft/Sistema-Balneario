import 'package:flutter/material.dart';

class LimitedWrap extends StatelessWidget {
  final int maxLines;
  final double spacing;
  final double runSpacing;
  final List<Widget> chips;

  const LimitedWrap({
    super.key,
    this.maxLines = 3,
    this.spacing = 8.0,
    this.runSpacing = 8.0,
    required this.chips,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final List<Widget> visibleChips = [];

        double totalWidth = 0;
        int currentLine = 1;

        for (int i = 0; i < chips.length; i++) {
          double chipWidth = _estimateChipWidth(context, chips[i]);
          if (totalWidth + chipWidth > constraints.maxWidth) {
            currentLine++;
            if (currentLine > maxLines) {
              // Replace the last chip with '...'
              if (visibleChips.isNotEmpty) {
                visibleChips.removeLast();
              }
              visibleChips.add(
                FilterChip(onSelected: (_) {}, label: Text('...')),
              );
              break;
            }
            totalWidth = 0;
          }
          visibleChips.add(chips[i]);
          totalWidth += chipWidth + spacing;
        }

        return Wrap(
          spacing: spacing,
          runSpacing: runSpacing,
          children: visibleChips,
        );
      },
    );
  }

  double _estimateChipWidth(BuildContext context, Widget chip) {
    if (chip is FilterChip && chip.label is Text) {
      final label = (chip.label as Text).data ?? '';
      final textStyle = Theme.of(context).textTheme.bodyMedium!;
      final textPainter = TextPainter(
        text: TextSpan(text: label, style: textStyle),
        maxLines: 1,
        textDirection: TextDirection.ltr,
      )..layout();
      return textPainter.width + 48; // icon + padding approx
    }
    return 80; // fallback estimate
  }
}
