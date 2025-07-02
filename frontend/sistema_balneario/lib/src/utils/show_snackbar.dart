import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/app.dart';

Future<void> showSnackbar(String content) async {
  final context = CasaFacil.appKey.currentContext;
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
