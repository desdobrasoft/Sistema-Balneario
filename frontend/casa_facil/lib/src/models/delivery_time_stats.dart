import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const count = 'count';
  static const fill = 'fill';
  static const range = 'range';
}

class _Defaults {
  const _Defaults._();

  static const fill = '#f3a462';
}

class DeliveryTimeStats {
  final int count;
  final String fill;
  final String range; // ex: "10-12 dias", "13-15 dias"

  const DeliveryTimeStats({
    required this.count,
    this.fill = _Defaults.fill,
    required this.range,
  });

  DeliveryTimeStats.fromJson(Map? json)
    : count = json?[_Keys.count],
      fill = json?[_Keys.fill] ?? _Defaults.fill,
      range = json?[_Keys.range];

  Map<String, Object?> toMap() => {
    _Keys.count: count,
    _Keys.fill: fill,
    _Keys.range: range,
  };

  @override
  String toString() => jsonEncode(toMap());
}
