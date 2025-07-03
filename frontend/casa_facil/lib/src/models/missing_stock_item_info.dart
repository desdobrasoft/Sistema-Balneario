import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/stock_item.dart';

class _Keys {
  const _Keys._();

  static const name = 'name';
  static const needed = 'needed';
  static const inStock = 'inStock';
  static const unit = 'unit';

  static const material = 'material';
}

class MissingStockItemInfo {
  final String materialId;
  final String name;
  final int needed;
  final int inStock;
  final String unit;

  StockItem? material;

  MissingStockItemInfo({
    required this.materialId,
    required this.name,
    required this.needed,
    required this.inStock,
    required this.unit,
  });

  Map<String, Object?> toMap() => {
    _Keys.material: material?.toMap(),
    _Keys.name: name,
    _Keys.needed: needed,
    _Keys.inStock: inStock,
    _Keys.unit: unit,
  };

  @override
  String toString() => jsonEncode(toMap());
}
