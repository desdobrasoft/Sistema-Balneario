import 'package:casa_facil/src/constants/constants.dart'
    show appRestorationScopeId;
import 'package:casa_facil/src/localization/app_localizations.dart';
import 'package:casa_facil/src/routes/router.dart' as router;
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:flutter/material.dart';

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
    return ListenableBuilder(
      listenable: Preferences.instance,
      builder: (context, _) {
        return MaterialApp.router(
          // obrigatórios
          /* Nenhum aqui */

          // opcionais
          debugShowCheckedModeBanner: false,
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
      },
    );
  }
}
