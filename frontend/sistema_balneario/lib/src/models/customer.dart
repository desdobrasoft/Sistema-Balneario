import 'dart:convert' show jsonEncode;

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const name = 'name';
  static const email = 'email';
  static const phone = 'phone';
  static const address = 'address';
  static const salesHistoryCount = 'salesHistoryCount';
}

class CustomerModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String address;
  final int salesHistoryCount;

  CustomerModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.address,
    required this.salesHistoryCount,
  });

  CustomerModel.fromJson(Map? json)
    : id = json?[_Keys.id],
      name = json?[_Keys.name],
      email = json?[_Keys.email],
      phone = json?[_Keys.phone],
      address = json?[_Keys.address],
      salesHistoryCount = json?[_Keys.salesHistoryCount];

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.name: name,
    _Keys.email: email,
    _Keys.phone: phone,
    _Keys.address: address,
    _Keys.salesHistoryCount: salesHistoryCount,
  };

  @override
  String toString() => jsonEncode(toMap());
}
