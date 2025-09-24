import 'package:flutter/services.dart';

/// Formata o texto de um input como moeda (ex: 12345 -> 123,45).
///
/// Este formatador trata a entrada de dígitos como se fossem centavos,
/// movendo a vírgula da direita para a esquerda.
class CurrencyInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // Remove todos os caracteres que não são dígitos
    final digitsOnly = newValue.text
        .replaceAll(RegExp(r'\D'), '')
        .replaceFirst(RegExp(r'^0+'), '')
        .padLeft(3, '0');

    // Separa a parte inteira (reais) e a parte decimal (centavos)
    final integerPart = digitsOnly.substring(0, digitsOnly.length - 2);
    final decimalPart = digitsOnly.substring(digitsOnly.length - 2);

    // Constrói a string final formatada
    final formattedString = '$integerPart,$decimalPart';
    return TextEditingValue(
      text: formattedString,
      selection: TextSelection.collapsed(offset: formattedString.length),
    );
  }
}
