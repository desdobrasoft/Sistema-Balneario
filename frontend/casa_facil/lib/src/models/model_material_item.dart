import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const name = 'name';
  static const quantity = 'quantity';
}

class ModelMaterialItem {
  final String id;
  final String name;
  final double quantity;

  const ModelMaterialItem({
    required this.id,
    required this.name,
    required this.quantity,
  });

  ModelMaterialItem.fromJson(Map? json)
    : id = json?[_Keys.id],
      name = json?[_Keys.name],
      quantity = json?[_Keys.quantity];

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.name: name,
    _Keys.quantity: quantity,
  };

  @override
  String toString() => jsonEncode(toMap());
}
