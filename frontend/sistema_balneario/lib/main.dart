import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/services/env/env.dart';
import 'package:sistema_balneario/src/services/preferences/preferences.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EnvManager.env.init();
  await Preferences.instance.load();
  runApp(const CasaFacil());
}
