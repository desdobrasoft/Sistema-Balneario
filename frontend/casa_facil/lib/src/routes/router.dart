import 'package:casa_facil/src/api/auth.dart';
import 'package:casa_facil/src/app.dart';
import 'package:casa_facil/src/routes/home/clientes/clientes.dart';
import 'package:casa_facil/src/routes/home/dashboard/dashboard.dart';
import 'package:casa_facil/src/routes/home/entregas/entregas.dart';
import 'package:casa_facil/src/routes/home/estoque/estoque.dart';
import 'package:casa_facil/src/routes/home/financeiro/financeiro.dart';
import 'package:casa_facil/src/routes/home/home.dart';
import 'package:casa_facil/src/routes/home/modelos/modelos.dart';
import 'package:casa_facil/src/routes/home/producao/producao.dart';
import 'package:casa_facil/src/routes/home/usuarios/usuarios.dart';
import 'package:casa_facil/src/routes/home/vendas/vendas.dart';
import 'package:casa_facil/src/routes/login/login.dart';
import 'package:casa_facil/src/routes/routes.dart';
import 'package:flutter/widgets.dart' show BackButtonListener, PopScope;
import 'package:go_router/go_router.dart';

class Router {
  // private:
  Router._();

  final _router = GoRouter(
    navigatorKey: CasaFacil.appKey,
    initialLocation: Routes.login.path,
    routes: [
      GoRoute(
        path: Routes.login.path,
        name: Routes.login.name,
        redirect: (context, state) {
          if (AuthApi.api.isAuthenticated) {
            return Routes.home.path;
          }
          return null;
        },
        builder: (context, state) {
          return BackButtonListener(
            onBackButtonPressed: () async => !context.canPop(),
            child: PopScope(canPop: false, child: Login()),
          );
        },
      ),
      GoRoute(
        path: Routes.home.path,
        name: Routes.home.name,
        redirect: (context, state) {
          if (!AuthApi.api.isAuthenticated) {
            return Routes.login.path;
          }
          if (state.fullPath == Routes.home.path) {
            return Routes.dashboard.path;
          }
          return null;
        },
        builder: (context, state) {
          return BackButtonListener(
            onBackButtonPressed: () async => !context.canPop(),
            child: PopScope(canPop: false, child: Home()),
          );
        },
        routes: [
          GoRoute(
            path: Routes.dashboard.name,
            name: Routes.dashboard.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Dashboard()));
            },
          ),
          GoRoute(
            path: Routes.users.name,
            name: Routes.users.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Users()));
            },
          ),
          GoRoute(
            path: Routes.customers.name,
            name: Routes.customers.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Customers()));
            },
          ),
          GoRoute(
            path: Routes.houseCatalog.name,
            name: Routes.houseCatalog.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: HouseCatalog()));
            },
          ),
          GoRoute(
            path: Routes.salesRecord.name,
            name: Routes.salesRecord.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: SalesRecord()));
            },
          ),
          GoRoute(
            path: Routes.progress.name,
            name: Routes.progress.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Producao()));
            },
          ),
          GoRoute(
            path: Routes.deliveryManagement.name,
            name: Routes.deliveryManagement.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Entregas()));
            },
          ),
          GoRoute(
            path: Routes.finance.name,
            name: Routes.finance.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Finance()));
            },
          ),
          GoRoute(
            path: Routes.stock.name,
            name: Routes.stock.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Stock()));
            },
          ),
        ],
      ),
    ],
  );

  // public:
  static final instance = Router._();

  GoRouter get router => instance._router;
}
