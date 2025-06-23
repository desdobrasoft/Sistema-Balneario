import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const category = 'category';
  static const lastEntryDate = 'lastEntryDate';
  static const lastExitDate = 'lastExitDate';
  static const lowStockThreshold = 'lowStockThreshold';
  static const name = 'name';
  static const quantityInStock = 'quantityInStock';
  static const unit = 'unit';
}

class StockItem {
  final String id;
  final String? category;
  final String? lastEntryDate;
  final String? lastExitDate;
  final int lowStockThreshold;
  final String name;
  final int quantityInStock;
  final String unit;

  const StockItem({
    required this.id,
    this.category,
    this.lastEntryDate,
    this.lastExitDate,
    required this.lowStockThreshold,
    required this.name,
    required this.quantityInStock,
    required this.unit,
  });

  StockItem.fromJson(Map? json)
    : id = json?[_Keys.id],
      category = json?[_Keys.category],
      lastEntryDate = json?[_Keys.lastEntryDate],
      lastExitDate = json?[_Keys.lastExitDate],
      lowStockThreshold = json?[_Keys.lowStockThreshold],
      name = json?[_Keys.name],
      quantityInStock = json?[_Keys.quantityInStock],
      unit = json?[_Keys.unit];

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.category: category,
    _Keys.lastEntryDate: lastEntryDate,
    _Keys.lastExitDate: lastExitDate,
    _Keys.lowStockThreshold: lowStockThreshold,
    _Keys.name: name,
    _Keys.quantityInStock: quantityInStock,
    _Keys.unit: unit,
  };

  @override
  String toString() => jsonEncode(toMap());
}
