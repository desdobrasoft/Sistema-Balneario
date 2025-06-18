import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/services/env/env.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EnvManager.env.init();
  runApp(const CasaFacil());
}
