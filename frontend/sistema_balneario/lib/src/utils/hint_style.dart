import 'package:flutter/material.dart'
    show ColorScheme, BuildContext, TextStyle;
import 'package:sistema_balneario/src/app.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show hintAlpha;

TextStyle? hintStyle([BuildContext? context]) {
  final ctx = context ?? CasaFacil.appKey.currentContext;
  if (ctx == null) return null;

  return TextStyle(color: ColorScheme.of(ctx).onSurface.withAlpha(hintAlpha));
}
