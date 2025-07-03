import 'package:casa_facil/src/app.dart';
import 'package:flutter/material.dart';

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
