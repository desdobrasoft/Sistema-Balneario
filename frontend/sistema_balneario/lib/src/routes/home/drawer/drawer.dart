import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/routes/home/drawer/drawer_tile.dart';
import 'package:sistema_balneario/src/routes/home/drawer/logo.dart';
import 'package:sistema_balneario/src/routes/routes.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class HomeDrawer extends StatefulWidget {
  const HomeDrawer({super.key, this.isExpanded = true});

  final bool isExpanded;

  @override
  State<HomeDrawer> createState() => _HomeDrawerState();
}

class _HomeDrawerState extends State<HomeDrawer> {
  static const double _collapsedWidth = 72;
  static const double _width = 256;

  static List<Map<String, dynamic>>? _routes;

  @override
  Widget build(BuildContext context) {
    _routes ??= [
      {
        _Keys.icon: Icon(Icons.dashboard_outlined),
        _Keys.label: localization(context).homeNavigationDashboardLabel,
        _Keys.selectedIcon: Icon(Icons.dashboard),
        _Keys.path: Routes.dashboard.path,
      },
      {
        _Keys.icon: Icon(Icons.settings_outlined),
        _Keys.label: localization(context).homeNavigationSettingsLabel,
        _Keys.selectedIcon: Icon(Icons.settings),
        _Keys.path: Routes.settings.path,
      },
    ];

    return Drawer(
      width: widget.isExpanded ? _width : _collapsedWidth,
      child: Padding(
        padding: EdgeInsets.all(AppSizes.gap.sm).copyWith(bottom: 0),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return Container(
              constraints: BoxConstraints(maxWidth: constraints.minWidth),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.isExpanded) ...[DrawerLogo(), Divider()],
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(bottom: AppSizes.gap.sm),
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          spacing: AppSizes.gap.sm,
                          children: _routes!.map((route) {
                            if (widget.isExpanded) {
                              return DrawerTile(
                                path: route[_Keys.path],

                                icon: route[_Keys.icon],
                                selectedIcon: route[_Keys.selectedIcon],
                                title: route[_Keys.label],
                              );
                            }

                            return DrawerTile(
                              path: route[_Keys.path],

                              icon: route[_Keys.icon],
                              selectedIcon: route[_Keys.selectedIcon],
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Keys {
  const _Keys._();

  static const icon = 'icon';
  static const label = 'label';
  static const selectedIcon = 'selectedIcon';
  static const path = 'path';
}
