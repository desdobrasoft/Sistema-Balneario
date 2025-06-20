import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const quantity = 'quantity';
}

class ModelMaterialItem {
  final String id;
  final double quantity;

  const ModelMaterialItem({required this.id, required this.quantity});

  ModelMaterialItem.fromJson(Map? json)
    : id = json?[_Keys.id],
      quantity = json?[_Keys.quantity];

  Map<String, Object?> toMap() => {_Keys.id: id, _Keys.quantity: quantity};

  @override
  String toString() => jsonEncode(toMap());
}
