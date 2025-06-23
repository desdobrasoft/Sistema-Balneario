import 'package:flutter/widgets.dart' show BackButtonListener, PopScope;
import 'package:go_router/go_router.dart';
import 'package:sistema_balneario/src/api/auth.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/routes/home/customers/customers.dart';
import 'package:sistema_balneario/src/routes/home/dashboard/dashboard.dart';
import 'package:sistema_balneario/src/routes/home/delivery_management/delivery_management.dart';
import 'package:sistema_balneario/src/routes/home/finance/finance.dart';
import 'package:sistema_balneario/src/routes/home/home.dart';
import 'package:sistema_balneario/src/routes/home/house_catalog/house_catalog.dart';
import 'package:sistema_balneario/src/routes/home/progress/progress.dart';
import 'package:sistema_balneario/src/routes/home/sales_record/sales_record.dart';
import 'package:sistema_balneario/src/routes/home/stock/stock.dart';
import 'package:sistema_balneario/src/routes/login/login.dart';
import 'package:sistema_balneario/src/routes/routes.dart';

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
              return NoTransitionPage(child: Home(child: Progress()));
            },
          ),
          GoRoute(
            path: Routes.deliveryManagement.name,
            name: Routes.deliveryManagement.name,
            pageBuilder: (context, state) {
              return NoTransitionPage(child: Home(child: DeliveryManagement()));
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
