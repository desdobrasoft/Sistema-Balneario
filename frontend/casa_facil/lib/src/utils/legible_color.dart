import 'package:flutter/material.dart';

double _contrastRatio(Color a, Color b) {
  final lum1 = a.computeLuminance();
  final lum2 = b.computeLuminance();

  final double lighter;
  final double darker;

  if (lum1 > lum2) {
    lighter = lum1;
    darker = lum2;
  } else {
    lighter = lum2;
    darker = lum1;
  }

  return (lighter + 0.05) / (darker + 0.05);
}

/// Ajusta [foregroundColor] para ser legível em cima de [backgroundColor].
///
/// A [W3C recomenda](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html)
/// que um texto de fonte menor ou igual a 18 pontos (14 se negrito) tenha um
/// [contrastRatio] de pelo menos 4.5, ou de 3.0 para fontes maiores.
Color legibleColor({
  required Color backgroundColor,
  required Color foregroundColor,
  double contrastRatio = 4.5,
}) {
  if (_contrastRatio(foregroundColor, backgroundColor) >= contrastRatio) {
    return foregroundColor;
  }

  final hsl = HSLColor.fromColor(foregroundColor);
  final lighten = backgroundColor.computeLuminance() < 0.5;

  int i = 1;
  while (true) {
    final amount = 0.05 * i;
    final double lightness = lighten
        ? (hsl.lightness + amount).clamp(0, 1)
        : (hsl.lightness - amount).clamp(0, 1);
    final adjusted = hsl.withLightness(lightness).toColor();

    if (_contrastRatio(adjusted, backgroundColor) >= contrastRatio ||
        lightness >= 1 ||
        lightness <= 0) {
      return adjusted;
    }
    i++;
  }
}
