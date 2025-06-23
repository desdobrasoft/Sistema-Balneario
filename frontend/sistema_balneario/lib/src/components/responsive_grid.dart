import 'dart:math' show min;

import 'package:flutter/material.dart';

class ResponsiveGrid extends StatelessWidget {
  const ResponsiveGrid({
    super.key,
    this.crossAxisCount,
    this.runSpacing = 0,
    this.spacing = 0,
    required this.children,
  });

  final int? crossAxisCount;
  final double runSpacing;
  final double spacing;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final count = crossAxisCount ?? children.length;

    return ListView.builder(
      itemCount: (children.length / count).ceil(),
      shrinkWrap: true,
      itemBuilder: (context, i) {
        return Padding(
          padding: EdgeInsets.only(top: i == 0 ? 0 : spacing),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: runSpacing,
            children: List.generate(
              min(count, children.length - i * count),
              (j) => Expanded(child: children[i * count + j]),
            ),
          ),
        );
      },
    );
  }
}
