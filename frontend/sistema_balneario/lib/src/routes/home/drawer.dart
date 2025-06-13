import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/routes/routes.dart';

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

  static final List<Map<String, dynamic>> _routes = [
    {
      'icon': Icon(Icons.dashboard_outlined),
      'label': Text('Painel'),
      'selectedIcon': Icon(Icons.dashboard),
      'path': Routes.dashboard.path,
    },
    {
      'icon': Icon(Icons.settings_outlined),
      'label': Text('Configurações'),
      'selectedIcon': Icon(Icons.settings),
      'path': Routes.settings.path,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouter.of(context).state.fullPath;
    final index = _routes.indexWhere((r) => r['path'] == currentPath);
    final selectedIndex = index < 0 || index >= _routes.length ? 0 : index;

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
          destinations: List.generate(
            _routes.length,
            (i) => NavigationRailDestination(
              icon: _routes[i]['icon'],
              label: _routes[i]['label'],
              selectedIcon: _routes[i]['selectedIcon'],
            ),
          ),
          backgroundColor: _scheme.surfaceContainer,
          extended: _isExpanded || _isHovered,
          key: ValueKey('rail'),
          onDestinationSelected: (i) => context.go(_routes[i]['path']),
          selectedIndex: selectedIndex,
        ),
      ),
    );
  }

  static Widget _navigationDrawer() {
    final context = SistemaBalneario.appKey.currentContext;
    if (context == null) return SizedBox();

    final currentPath = GoRouter.of(context).state.fullPath;
    final selectedIndex = _routes.indexWhere((r) => r['path'] == currentPath);

    return NavigationDrawer(
      key: ValueKey('drawer'),
      onDestinationSelected: (i) => context.go(_routes[i]['path']),
      selectedIndex: selectedIndex,
      children: List.generate(_routes.length * 2, (i) {
        if (i % 2 == 0) {
          return SizedBox(height: AppSizes.gap.xs);
        }
        return NavigationDrawerDestination(
          icon: _routes[i ~/ 2]['icon'],
          label: _routes[i ~/ 2]['label'],
          selectedIcon: _routes[i ~/ 2]['selectedIcon'],
        );
      }),
    );
  }
}
