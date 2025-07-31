import 'package:casa_facil/src/app.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EnvManager.env.init();
  await Preferences.instance.load();
  runApp(const CasaFacil());
}
