import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show appRestorationScopeId;
import 'package:sistema_balneario/src/localization/app_localizations.dart';
import 'package:sistema_balneario/src/routes/router.dart' as router;

class CasaFacil extends StatefulWidget {
  const CasaFacil({super.key});

  // private:
  static final _key = GlobalKey<NavigatorState>();

  // public:
  static GlobalKey<NavigatorState> get appKey => _key;

  @override
  State<CasaFacil> createState() => _CasaFacilState();
}

class _CasaFacilState extends State<CasaFacil> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      // obrigatórios
      /* Nenhum aqui */

      // opcionais
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      restorationScopeId: appRestorationScopeId,
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
