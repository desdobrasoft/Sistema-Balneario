import 'package:flutter/material.dart'
    show ColorScheme, BuildContext, TextStyle;
import 'package:tech_wall/src/app.dart';
import 'package:tech_wall/src/constants/constants.dart' show hintAlpha;

TextStyle? hintStyle([BuildContext? context]) {
  final ctx = context ?? TechWall.appKey.currentContext;
  if (ctx == null) return null;

  return TextStyle(color: ColorScheme.of(ctx).onSurface.withAlpha(hintAlpha));
}
