import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/routes/home/drawer/drawer_tile.dart';
import 'package:sistema_balneario/src/routes/home/drawer/logo.dart';
import 'package:sistema_balneario/src/routes/routes.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class _Route {
  const _Route({
    required this.path,
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String path;
  final String label;

  final Widget icon;
  final Widget selectedIcon;
}

class HomeDrawer extends StatefulWidget {
  const HomeDrawer({super.key, this.isExpanded = true});

  final bool isExpanded;

  @override
  State<HomeDrawer> createState() => _HomeDrawerState();
}

class _HomeDrawerState extends State<HomeDrawer> {
  static const double _collapsedWidth = 72;
  static const double _width = 256;

  static List<_Route>? _routes;

  @override
  Widget build(BuildContext context) {
    _routes ??= [
      _Route(
        path: Routes.dashboard.path,
        label: localization(context).homeNavigationDashboardLabel,
        icon: Icon(Icons.dashboard_outlined),
        selectedIcon: Icon(Icons.dashboard),
      ),
      _Route(
        path: Routes.settings.path,
        label: localization(context).homeNavigationSettingsLabel,
        icon: Icon(Icons.settings_outlined),
        selectedIcon: Icon(Icons.settings),
      ),
    ];

    return Drawer(
      width: widget.isExpanded ? _width : _collapsedWidth,
      child: Padding(
        padding: EdgeInsets.all(AppSizes.gap.sm).copyWith(bottom: 0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.isExpanded) ...[DrawerLogo(), Divider()],
              ],
            ),

            Expanded(
              child: Padding(
                padding: EdgeInsets.only(bottom: AppSizes.gap.sm),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    spacing: AppSizes.gap.sm,
                    children: _routes!.map((route) {
                      return DrawerTile(
                        path: route.path,
                        title: widget.isExpanded ? route.label : null,

                        icon: route.icon,
                        selectedIcon: route.selectedIcon,
                      );
                    }).toList(),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
