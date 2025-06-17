import 'package:flutter/widgets.dart' show BackButtonListener, PopScope;
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/api/auth.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/dashboard.dart';
import 'package:sistema_balneario/src/routes/home/home.dart';
import 'package:sistema_balneario/src/routes/home/settings/settings.dart';
import 'package:sistema_balneario/src/routes/login/login.dart';
import 'package:sistema_balneario/src/routes/routes.dart';

class Router {
  // private:
  Router._();

  final _router = GoRouter(
    navigatorKey: SistemaBalneario.appKey,
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
            path: Routes.settings.name,
            name: Routes.settings.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: Settings()));
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
