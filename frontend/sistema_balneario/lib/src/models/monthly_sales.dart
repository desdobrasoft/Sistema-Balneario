import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const month = 'month';
  static const sales = 'sales';
}

class MonthlySales {
  final String month;
  final double sales;

  MonthlySales({required this.month, required this.sales});

  MonthlySales.fromJson(Map? json)
    : month = json?[_Keys.month],
      sales = json?[_Keys.sales];

  Map<String, Object?> toMap() => {_Keys.month: month, _Keys.sales: sales};

  @override
  String toString() => jsonEncode(toMap());
}
