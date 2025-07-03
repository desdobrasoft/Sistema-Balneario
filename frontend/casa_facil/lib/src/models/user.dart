import 'dart:convert' show jsonEncode;

class UserModel {
  final String? createdAt;
  final String? email;
  final int id;
  final bool isActive;
  final String? updatedAt;
  final String? username;

  const UserModel({
    required this.createdAt,
    this.email,
    required this.id,
    required this.isActive,
    required this.updatedAt,
    this.username,
  });

  UserModel.fromJson(Map? json)
    : createdAt = json?[_Keys.createdAt],
      email = json?[_Keys.email],
      id = json?[_Keys.id],
      isActive = json?[_Keys.isActive],
      updatedAt = json?[_Keys.updatedAt],
      username = json?[_Keys.username];

  Map<String, Object?> toMap() => {
    _Keys.createdAt: createdAt,
    _Keys.email: email,
    _Keys.id: id,
    _Keys.isActive: isActive,
    _Keys.updatedAt: updatedAt,
    _Keys.username: username,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const createdAt = 'created_at';
  static const email = 'email';
  static const id = 'id';
  static const isActive = 'is_active';
  static const updatedAt = 'updated_at';
  static const username = 'username';
}
