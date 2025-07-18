import 'package:casa_facil/src/api/auth.dart';
import 'package:casa_facil/src/constants/constants.dart' show gapsm;
import 'package:casa_facil/src/models/role_type.dart';
import 'package:casa_facil/src/routes/home/drawer/drawer_tile.dart';
import 'package:casa_facil/src/routes/home/drawer/logo.dart';
import 'package:casa_facil/src/routes/routes.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:flutter/material.dart';
import 'package:flutter_mdi_icons/flutter_mdi_icons.dart';

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
    return ListenableBuilder(
      listenable: AuthApi.api,
      builder: (context, _) {
        final roles = AuthApi.api.user?.roles;
        final isAdmin = roles?.contains(RoleType.admin) == true;

        _routes = [
          _Route(
            path: Routes.dashboard.path,
            label: localization(context).homeNavigationDashboardLabel,
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
          ),
          if (isAdmin)
            _Route(
              path: Routes.users.path,
              label: 'Usuários',
              icon: Icon(Icons.group_outlined),
              selectedIcon: Icon(Icons.group),
            ),
          _Route(
            path: Routes.customers.path,
            label: localization(context).homeNavigationCustomersLabel,
            icon: Icon(Icons.group_outlined),
            selectedIcon: Icon(Icons.group),
          ),
          _Route(
            path: Routes.houseCatalog.path,
            label: localization(context).homeNavigationCatalogLabel,
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
          ),
          _Route(
            path: Routes.salesRecord.path,
            label: localization(context).homeNavigationSalesRecordLabel,
            icon: Icon(Icons.shopping_cart_outlined),
            selectedIcon: Icon(Icons.shopping_cart),
          ),
          _Route(
            path: Routes.progress.path,
            label: localization(context).homeNavigationProgressLabel,
            icon: Icon(Mdi.cogs),
            selectedIcon: Icon(Mdi.cogs),
          ),
          _Route(
            path: Routes.deliveryManagement.path,
            label: localization(context).homeNavigationDeliveryLabel,
            icon: Icon(Mdi.truckOutline),
            selectedIcon: Icon(Mdi.truck),
          ),
          _Route(
            path: Routes.finance.path,
            label: localization(context).homeNavigationFinanceLabel,
            icon: Icon(Icons.payments_outlined),
            selectedIcon: Icon(Icons.payments),
          ),
          _Route(
            path: Routes.stock.path,
            label: localization(context).homeNavigationStockLabel,
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory),
          ),
        ];

        return Drawer(
          width: widget.isExpanded ? _width : _collapsedWidth,
          child: Padding(
            padding: EdgeInsets.all(gapsm).copyWith(bottom: 0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    widget.isExpanded ? DrawerLogo() : DrawerLogo.mini(),
                    Divider(),
                  ],
                ),

                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: gapsm),
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        spacing: gapsm,
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
      },
    );
  }
}
