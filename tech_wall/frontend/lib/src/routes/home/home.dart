import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/components/home_popup_menu.dart';
import 'package:tech_wall/src/constants/constants.dart' show gapmd;
import 'package:tech_wall/src/enums/window_class.dart';
import 'package:tech_wall/src/routes/home/drawer/drawer.dart';
import 'package:tech_wall/src/routes/routes.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class Home extends StatefulWidget {
  const Home({super.key, this.child});

  final Widget? child;

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  // Essa flag é estática para manter o estado entre rotas.
  final _expandDrawer = ValueNotifier(true);

  WindowClass _windowClass = WindowClass.expanded;

  @override
  Widget build(BuildContext context) {
    final newWC = WindowClass.fromWidth(MediaQuery.of(context).size.width);
    if (newWC != _windowClass) {
      setState(() => _windowClass = newWC);
    }

    final body = Scaffold(
      appBar: AppBar(
        leading: _windowClass != WindowClass.expanded
            ? null
            : IconButton(
                onPressed: () => _expandDrawer.value = !_expandDrawer.value,
                icon: ValueListenableBuilder(
                  valueListenable: _expandDrawer,
                  builder: (context, expand, _) {
                    if (expand) return Icon(Icons.menu_open);
                    return Icon(Icons.menu);
                  },
                ),
              ),
        title: Text(_title()),
        actions: [HomePopupMenu()],
      ),
      drawer: HomeDrawer(),
      body: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(gapmd),
        ),
        child: widget.child,
      ),
    );

    return Material(
      color: ColorScheme.of(context).surface,
      child: Row(
        children: [
          if (_windowClass == WindowClass.expanded) _drawer(),
          Expanded(child: body),
        ],
      ),
    );
  }

  Widget _drawer() {
    return ValueListenableBuilder(
      valueListenable: _expandDrawer,
      builder: (context, expand, _) {
        return HomeDrawer(isExpanded: expand);
      },
    );
  }

  String _title() {
    return switch (Routes.fromPath(
      GoRouter.maybeOf(context)?.routeInformationProvider.value.uri.toString(),
    )) {
      Routes.login => localization(context).appTitle,
      Routes.sessaoExpirada => localization(context).appTitle,
      Routes.home => localization(context).appTitle,
      Routes.dashboard => localization(context).homeNavigationDashboardLabel,
      Routes.clientes => localization(context).homeNavigationCustomersLabel,
      Routes.modelos => localization(context).homeNavigationCatalogLabel,
      Routes.vendas => localization(context).homeNavigationSalesRecordLabel,
      Routes.producao => localization(context).homeNavigationProgressLabel,
      Routes.entregas => localization(context).homeNavigationDeliveryLabel,
      Routes.financeiro => localization(context).homeNavigationFinanceLabel,
      Routes.estoque => localization(context).homeNavigationStockLabel,
      Routes.usuarios => 'Usuários',
    };
  }
}
