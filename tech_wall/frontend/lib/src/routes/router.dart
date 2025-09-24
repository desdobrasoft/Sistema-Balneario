import 'package:flutter/widgets.dart' show BackButtonListener, PopScope;
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/api/auth.dart';
import 'package:tech_wall/src/app.dart';
import 'package:tech_wall/src/routes/home/clientes/clientes.dart';
import 'package:tech_wall/src/routes/home/dashboard/dashboard.dart';
import 'package:tech_wall/src/routes/home/entregas/entregas.dart';
import 'package:tech_wall/src/routes/home/estoque/estoque.dart';
import 'package:tech_wall/src/routes/home/financeiro/financeiro.dart';
import 'package:tech_wall/src/routes/home/home.dart';
import 'package:tech_wall/src/routes/home/modelos/modelos.dart';
import 'package:tech_wall/src/routes/home/producao/producao.dart';
import 'package:tech_wall/src/routes/home/usuarios/usuarios.dart';
import 'package:tech_wall/src/routes/home/vendas/vendas.dart';
import 'package:tech_wall/src/routes/login/login.dart';
import 'package:tech_wall/src/routes/routes.dart';
import 'package:tech_wall/src/routes/sessao_expirada/sessao_expirada.dart';

class Router {
  // private:
  Router._();

  final _router = GoRouter(
    navigatorKey: TechWall.appKey,
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
        path: Routes.sessaoExpirada.path,
        name: Routes.sessaoExpirada.name,
        builder: (context, state) {
          return BackButtonListener(
            onBackButtonPressed: () async => !context.canPop(),
            child: PopScope(canPop: false, child: const SessaoExpirada()),
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
            path: Routes.usuarios.name,
            name: Routes.usuarios.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Users()));
            },
          ),
          GoRoute(
            path: Routes.clientes.name,
            name: Routes.clientes.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Customers()));
            },
          ),
          GoRoute(
            path: Routes.modelos.name,
            name: Routes.modelos.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: HouseCatalog()));
            },
          ),
          GoRoute(
            path: Routes.vendas.name,
            name: Routes.vendas.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: SalesRecord()));
            },
          ),
          GoRoute(
            path: Routes.producao.name,
            name: Routes.producao.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Producao()));
            },
          ),
          GoRoute(
            path: Routes.entregas.name,
            name: Routes.entregas.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Entregas()));
            },
          ),
          GoRoute(
            path: Routes.financeiro.name,
            name: Routes.financeiro.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Finance()));
            },
          ),
          GoRoute(
            path: Routes.estoque.name,
            name: Routes.estoque.name,
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
