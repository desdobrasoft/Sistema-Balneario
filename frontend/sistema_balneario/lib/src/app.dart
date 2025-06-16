import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/constants.dart';
import 'package:sistema_balneario/src/localization/app_localizations.dart';
import 'package:sistema_balneario/src/routes/router.dart' as router;

class SistemaBalneario extends StatefulWidget {
  const SistemaBalneario({super.key});

  // private:
  static final _key = GlobalKey<NavigatorState>();

  // public:
  static GlobalKey<NavigatorState> get appKey => _key;

  @override
  State<SistemaBalneario> createState() => _SistemaBalnearioState();
}

class _SistemaBalnearioState extends State<SistemaBalneario> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      // obrigatórios
      /* Nenhum aqui */

      // opcionais
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      restorationScopeId: Constants.appRestorationScopeId,
      routerConfig: router.Router.instance.router,
      supportedLocales: AppLocalizations.supportedLocales,
      theme: ThemeData.light(useMaterial3: true),
      darkTheme: ThemeData.dark(useMaterial3: true),

      // callbacks
      onGenerateTitle: (context) => AppLocalizations.of(context)!.appTitle,

      // widgets
      /* Nenhum aqui */
    );
  }
}
