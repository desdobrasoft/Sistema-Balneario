import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapsm;
import 'package:tech_wall/src/utils/get_localization.dart';

enum _Variant { normal, mini }

class DrawerLogo extends StatelessWidget {
  final _Variant _variant;

  const DrawerLogo({super.key}) : _variant = _Variant.normal;

  const DrawerLogo.mini({super.key}) : _variant = _Variant.mini;

  static const double _size = 35;

  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);

    return switch (_variant) {
      _Variant.normal => Row(
        mainAxisSize: MainAxisSize.min,
        spacing: gapsm,
        children: [
          Icon(
            LucideIcons.building,
            color: scheme.onSurfaceVariant,
            size: _size,
          ),
          Text(localization(context).appTitle, style: styles.titleLarge),
        ],
      ),
      _Variant.mini => Icon(
        LucideIcons.building,
        color: scheme.onSurfaceVariant,
        size: _size,
      ),
    };
  }
}
