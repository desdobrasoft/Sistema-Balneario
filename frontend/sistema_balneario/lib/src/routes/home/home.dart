import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/api/login.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/constants/sizes.dart';
import 'package:sistema_balneario/src/enums/window_class.dart';
import 'package:sistema_balneario/src/localization/app_localizations.dart';
import 'package:sistema_balneario/src/routes/home/drawer.dart';
import 'package:sistema_balneario/src/routes/routes.dart';

class Home extends StatefulWidget {
  const Home({super.key, this.child});

  final Widget? child;

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  static const _popupDuration = Durations.short4;

  // Essa flag é estática para manter o estado entre rotas.
  static final _expandDrawer = ValueNotifier(true);

  late AppLocalizations _localizations;

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

    _localizations = AppLocalizations.of(context)!;

    return Scaffold(
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
        title: Text(_localizations.appTitle),
        actions: [
          PopupMenuButton<String>(
            popUpAnimationStyle: AnimationStyle(
              curve: Curves.easeOutCirc,
              duration: _popupDuration,
              reverseCurve: Curves.easeInCirc,
              reverseDuration: _popupDuration,
            ),
            icon: Icon(Icons.more_vert),
            onSelected: (value) async {
              switch (value) {
                case "logout":
                  await AuthApi.api.logout();
                  if (context.mounted) {
                    context.goNamed(Routes.login.name);
                  }
                  break;
                default:
                  break;
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(value: "logout", child: Text('Logout')),
            ],
          ),
        ],
      ),
      drawer: _windowClass == WindowClass.compact ? HomeDrawer.drawer() : null,
      body: Builder(
        builder: (context) {
          final body = Expanded(
            child: Container(
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
          );

          switch (_windowClass) {
            case WindowClass.compact:
              // Essa Row é apenas para não gerar erros com o Expanded do body.
              return Row(children: [body]);
            case WindowClass.medium:
              return Stack(
                children: [
                  Row(children: [HomeDrawer.empty(), body]),
                  Row(
                    children: [
                      _drawer(),
                      Expanded(child: SizedBox()),
                    ],
                  ),
                ],
              );
            case WindowClass.expanded:
              return Row(children: [_drawer(), body]);
          }
        },
      ),
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
