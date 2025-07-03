import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const fill = 'fill';
  static const month = 'month';
  static const sales = 'sales';
}

class _Defaults {
  const _Defaults._();

  static const fill = '#e76e50';
}

class MonthlySales {
  final String fill;
  final String month;
  final double sales;

  const MonthlySales({
    this.fill = _Defaults.fill,
    required this.month,
    required this.sales,
  });

  MonthlySales.fromJson(Map? json)
    : fill = json?[_Keys.fill] ?? _Defaults.fill,
      month = json?[_Keys.month],
      sales = json?[_Keys.sales];

  Map<String, Object?> toMap() => {
    _Keys.fill: fill,
    _Keys.month: month,
    _Keys.sales: sales,
  };

  @override
  String toString() => jsonEncode(toMap());
}
