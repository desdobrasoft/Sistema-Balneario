import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';

class DrawerTile extends StatelessWidget {
  const DrawerTile({
    super.key,
    required this.path,
    this.icon,
    this.selectedIcon,
    this.title,
  });

  final String path;
  final String? title;

  final Widget? icon;
  final Widget? selectedIcon;

  static const double _tileHeight = 40;

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouter.of(context).state.fullPath;
    final selected = path == currentPath;
    final scheme = ColorScheme.of(context);

    return InkWell(
      borderRadius: BorderRadius.circular(_tileHeight / 2),

      onTap: () {
        if (path != currentPath) {
          context.go(path);
        }
      },

      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(_tileHeight / 2),
          color: selected ? scheme.secondaryContainer : null,
        ),
        height: _tileHeight,
        padding: EdgeInsets.symmetric(horizontal: AppSizes.gap.lg),

        child: Row(
          spacing: AppSizes.gap.md,
          children: [
            if (icon != null)
              selected && selectedIcon != null
                  ? _recolorIcon(selectedIcon!, scheme.onSecondaryContainer)
                  : _recolorIcon(
                      icon!,
                      selected
                          ? scheme.onSecondaryContainer
                          : scheme.onSurfaceVariant,
                    ),
            if (title != null)
              Expanded(
                child: Text(
                  title!,
                  style: TextTheme.of(context).labelMedium?.copyWith(
                    color: selected
                        ? scheme.onSecondaryContainer
                        : scheme.onSurfaceVariant,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _recolorIcon(Widget icon, Color color) {
    if (icon is Icon) {
      return Icon(icon.icon, color: color, size: icon.size);
    }

    if (icon is ImageIcon) {
      return ImageIcon(icon.image, color: color, size: icon.size);
    }

    return IconTheme(
      data: IconThemeData(color: color),
      child: icon,
    );
  }
}
