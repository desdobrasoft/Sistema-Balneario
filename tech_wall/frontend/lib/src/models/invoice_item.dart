import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const description = 'description';
  static const quantity = 'quantity';
  static const unitPrice = 'unitPrice';
  static const totalPrice = 'totalPrice';
}

class InvoiceItem {
  final String id;
  final String description;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  const InvoiceItem({
    required this.id,
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.description: description,
    _Keys.quantity: quantity,
    _Keys.unitPrice: unitPrice,
    _Keys.totalPrice: totalPrice,
  };

  @override
  String toString() => jsonEncode(toMap());
}
