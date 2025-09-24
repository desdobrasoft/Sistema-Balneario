import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class Logo extends StatelessWidget {
  const Logo({super.key});

  @override
  Widget build(BuildContext context) {
    final style = TextTheme.of(context).headlineMedium;

    return Container(
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.max,
        children: [
          Icon(LucideIcons.building, size: 50),
          Text('TechWall', textAlign: TextAlign.center, style: style),
        ],
      ),
    );
  }
}
