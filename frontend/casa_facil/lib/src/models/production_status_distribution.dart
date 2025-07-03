import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const count = 'count';
  static const fill = 'fill';
  static const status = 'status';
}

class ProductionStatusDistribution {
  final int count;
  final String fill;
  final String status;

  const ProductionStatusDistribution({
    required this.count,
    required this.fill,
    required this.status,
  });

  ProductionStatusDistribution.fromJson(Map? json)
    : count = json?[_Keys.count],
      fill = json?[_Keys.fill],
      status = json?[_Keys.status];

  Map<String, Object?> toMap() => {
    _Keys.count: count,
    _Keys.fill: fill,
    _Keys.status: status,
  };

  @override
  String toString() => jsonEncode(toMap());
}
