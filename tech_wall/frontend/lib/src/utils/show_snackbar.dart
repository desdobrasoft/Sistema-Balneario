import 'package:flutter/material.dart';
import 'package:tech_wall/src/app.dart';

Future<void> showSnackbar(String content) async {
  final context = TechWall.appKey.currentContext;
  if (context == null) return;

  final messenger = ScaffoldMessenger.of(context);
  messenger.clearSnackBars();
  messenger.showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      showCloseIcon: true,
      content: Text(content),
    ),
  );
}
