import 'package:flutter/material.dart';
import 'package:tech_wall/src/app.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/preferences/preferences.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EnvManager.env.init();
  await Preferences.instance.load();
  runApp(const TechWall());
}
