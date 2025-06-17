import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const count = 'count';
  static const range = 'range';
}

class DeliveryTimeStats {
  final int count;
  final String range; // ex: "10-12 dias", "13-15 dias"

  DeliveryTimeStats({required this.count, required this.range});

  DeliveryTimeStats.fromJson(Map? json)
    : count = json?[_Keys.count],
      range = json?[_Keys.range];

  Map<String, Object?> toMap() => {_Keys.count: count, _Keys.range: range};

  @override
  String toString() => jsonEncode(toMap());
}
