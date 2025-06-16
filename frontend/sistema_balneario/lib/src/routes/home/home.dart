import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/components/home_popup_menu.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/enums/window_class.dart';
import 'package:sistema_balneario/src/routes/home/drawer.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class Home extends StatefulWidget {
  const Home({super.key, this.child});

  final Widget? child;

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  // Essa flag é estática para manter o estado entre rotas.
  static final _expandDrawer = ValueNotifier(true);

  WindowClass _windowClass = WindowClass.expanded;

  @override
  void initState() {
    super.initState();

    final context = SistemaBalneario.appKey.currentContext;
    if (context != null) {
      _windowClass = WindowClass.fromWidth(MediaQuery.of(context).size.width);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _expandDrawer.value = _windowClass == WindowClass.expanded
            ? true
            : false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final newWC = WindowClass.fromWidth(MediaQuery.of(context).size.width);
    if (newWC != _windowClass) {
      setState(() => _windowClass = newWC);
    }

    // TODO: Verificar por que a drawer não tá recolhendo ao transicionar de expanded para medium.
    // TODO: Tratar cor de background da drawer.

    final body = Expanded(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.primaryFixed,
          foregroundColor: Theme.of(context).colorScheme.onPrimaryFixed,
          leading: _windowClass == WindowClass.compact
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
          title: Text(localization(context).appTitle),
          actions: [HomePopupMenu()],
        ),
        drawer: _windowClass == WindowClass.compact
            ? HomeDrawer.drawer()
            : null,
        body: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceContainerLow,
            borderRadius: BorderRadius.circular(AppSizes.gap.md),
          ),
          margin: EdgeInsets.all(AppSizes.gap.xs).copyWith(
            left: _windowClass == WindowClass.compact ? AppSizes.gap.xs : 0,
          ),
          child: widget.child,
        ),
      ),
    );

    return Material(
      child: switch (_windowClass) {
        WindowClass.compact => Row(children: [body]),
        WindowClass.medium => Stack(
          children: [
            // Essa Row é apenas para não gerar erros com o Expanded do body.
            Row(children: [HomeDrawer.empty(), body]),
            Row(
              children: [
                _drawer(),
                Expanded(child: SizedBox()),
              ],
            ),
          ],
        ),
        WindowClass.expanded => Row(children: [_drawer(), body]),
      },
    );
  }

  Widget _drawer() {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: AppSizes.gap.xs),
      child: ValueListenableBuilder(
        valueListenable: _expandDrawer,
        builder: (context, expand, _) {
          return HomeDrawer(isExpanded: expand);
        },
      ),
    );
  }
}
