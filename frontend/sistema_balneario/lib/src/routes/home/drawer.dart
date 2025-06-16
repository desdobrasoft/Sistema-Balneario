import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/routes/routes.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class HomeDrawer extends StatefulWidget {
  const HomeDrawer({super.key, this.isExpanded = true});

  static Widget empty() {
    return NavigationRail(
      destinations: [
        NavigationRailDestination(icon: SizedBox(), label: SizedBox()),
      ],
      selectedIndex: 0,
    );
  }

  static Widget drawer() => _HomeDrawerState._navigationDrawer();

  final bool isExpanded;

  @override
  State<HomeDrawer> createState() => _HomeDrawerState();
}

class _HomeDrawerState extends State<HomeDrawer> {
  late ColorScheme _scheme;

  bool _isExpanded = false;
  bool _isHovered = false;

  static List<Map<String, dynamic>>? _routes;

  @override
  Widget build(BuildContext context) {
    _routes ??= [
      {
        _Keys.icon: Icon(Icons.dashboard_outlined),
        _Keys.label: Text(localization(context).homeNavigationDashboardLabel),
        _Keys.selectedIcon: Icon(Icons.dashboard),
        _Keys.path: Routes.dashboard.path,
      },
      {
        _Keys.icon: Icon(Icons.settings_outlined),
        _Keys.label: Text(localization(context).homeNavigationSettingsLabel),
        _Keys.selectedIcon: Icon(Icons.settings),
        _Keys.path: Routes.settings.path,
      },
    ];

    final currentPath = GoRouter.of(context).state.fullPath;
    final index = _routes!.indexWhere((r) => r[_Keys.path] == currentPath);
    final selectedIndex = index < 0 || index >= _routes!.length ? 0 : index;

    _isExpanded = widget.isExpanded;
    _scheme = ColorScheme.of(context);

    return AnimatedSize(
      alignment: Alignment.centerLeft,
      curve: Curves.fastOutSlowIn,
      duration: Durations.short4,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),

        child: NavigationRail(
          backgroundColor: _scheme.surfaceContainer,
          extended: _isExpanded || _isHovered,
          key: ValueKey(_NavigationKeys.rail),
          selectedIndex: selectedIndex,

          onDestinationSelected: (i) => context.go(_routes![i][_Keys.path]),

          destinations: _routes!.map((route) {
            return NavigationRailDestination(
              icon: route[_Keys.icon],
              label: route[_Keys.label],
              selectedIcon: route[_Keys.selectedIcon],
            );
          }).toList(),
        ),
      ),
    );
  }

  static Widget _navigationDrawer() {
    final context = SistemaBalneario.appKey.currentContext;
    if (context == null) return SizedBox();

    final currentPath = GoRouter.of(context).state.fullPath;
    final selectedIndex = _routes!.indexWhere(
      (r) => r[_Keys.path] == currentPath,
    );

    return NavigationDrawer(
      key: ValueKey(_NavigationKeys.drawer),
      onDestinationSelected: (i) => context.go(_routes![i][_Keys.path]),
      selectedIndex: selectedIndex,
      children: List.generate(_routes!.length * 2, (i) {
        if (i % 2 == 0) {
          return SizedBox(height: AppSizes.gap.xs);
        }
        return NavigationDrawerDestination(
          icon: _routes![i ~/ 2][_Keys.icon],
          label: _routes![i ~/ 2][_Keys.label],
          selectedIcon: _routes![i ~/ 2][_Keys.selectedIcon],
        );
      }),
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

class _NavigationKeys {
  const _NavigationKeys._();

  static const drawer = 'drawer';
  static const rail = 'rail';
}
