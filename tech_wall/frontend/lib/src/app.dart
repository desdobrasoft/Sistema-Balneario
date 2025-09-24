import 'package:flutter/material.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show appRestorationScopeId;
import 'package:tech_wall/src/localization/app_localizations.dart';
import 'package:tech_wall/src/routes/router.dart' as router;
import 'package:tech_wall/src/services/preferences/preferences.dart';

class TechWall extends StatefulWidget {
  const TechWall({super.key});

  // private:
  static final _key = GlobalKey<NavigatorState>();

  // public:
  static GlobalKey<NavigatorState> get appKey => _key;

  @override
  State<TechWall> createState() => _TechWallState();
}

class _TechWallState extends State<TechWall> {
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
