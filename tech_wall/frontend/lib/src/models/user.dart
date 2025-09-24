import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/role_type.dart';

class UserModel {
  final String? createdAt;
  final String? email;
  final String? fullName;
  final int id;
  final bool isActive;
  final List<RoleType> roles;
  final String? updatedAt;
  final String? username;

  const UserModel({
    required this.createdAt,
    this.email,
    this.fullName,
    required this.id,
    required this.isActive,
    required this.roles,
    required this.updatedAt,
    this.username,
  });

  factory UserModel.fromJson(Map? json) {
    dynamic aux;

    aux = json?[_Keys.roles];
    final roles = aux is List
        ? aux.map((r) => RoleType.fromString(r)).toList()
        : List<RoleType>.empty();

    return UserModel(
      createdAt: json?[_Keys.createdAt],
      email: json?[_Keys.email],
      fullName: json?[_Keys.fullName],
      id: json?[_Keys.id],
      isActive: json?[_Keys.isActive],
      roles: roles,
      updatedAt: json?[_Keys.updatedAt],
      username: json?[_Keys.username],
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.createdAt: createdAt,
    _Keys.email: email,
    _Keys.fullName: fullName,
    _Keys.id: id,
    _Keys.isActive: isActive,
    _Keys.roles: roles.map((r) => r.name).toList(),
    _Keys.updatedAt: updatedAt,
    _Keys.username: username,
  };

  @override
  String toString() => jsonEncode(toMap());

  @override
  int get hashCode => Object.hashAll([id, runtimeType]);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;

    if (other.runtimeType != runtimeType) return false;

    return other is UserModel && other.id == id;
  }
}

class _Keys {
  const _Keys._();

  static const createdAt = 'created_at';
  static const email = 'email';
  static const fullName = 'full_name';
  static const id = 'id';
  static const isActive = 'is_active';
  static const roles = 'roles';
  static const updatedAt = 'updated_at';
  static const username = 'username';
}
