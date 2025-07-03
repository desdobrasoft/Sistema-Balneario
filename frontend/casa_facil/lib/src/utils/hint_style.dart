import 'package:casa_facil/src/app.dart';
import 'package:casa_facil/src/constants/constants.dart' show hintAlpha;
import 'package:flutter/material.dart'
    show ColorScheme, BuildContext, TextStyle;

TextStyle? hintStyle([BuildContext? context]) {
  final ctx = context ?? CasaFacil.appKey.currentContext;
  if (ctx == null) return null;

  return TextStyle(color: ColorScheme.of(ctx).onSurface.withAlpha(hintAlpha));
}
