import 'dart:convert' show jsonEncode;

class CreateUserDto {
  final String? fullName;
  final String? username;
  final String? email;
  final String password;
  final List<String>? roles;

  const CreateUserDto({
    this.fullName,
    this.username,
    this.email,
    required this.password,
    this.roles,
  });

  Map<String, dynamic> toMap() => {
    if (fullName != null && fullName!.isNotEmpty) 'full_name': fullName,
    if (username != null && username!.isNotEmpty) 'username': username,
    if (email != null && email!.isNotEmpty) 'email': email,
    'password': password,
    if (roles != null && roles!.isNotEmpty) 'roles': roles,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdateUserDto {
  final String? fullName;
  final String? username;
  final String? email;
  final String? password;
  final List<String>? roles;

  const UpdateUserDto({
    this.fullName,
    this.username,
    this.email,
    this.password,
    this.roles,
  });

  Map<String, dynamic> toMap() => {
    if (fullName != null && fullName!.isNotEmpty) 'full_name': fullName,
    if (username != null && username!.isNotEmpty) 'username': username,
    if (email != null && email!.isNotEmpty) 'email': email,
    if (password != null && password!.isNotEmpty) 'password': password,
    if (roles != null && roles!.isNotEmpty) 'roles': roles,
  };

  @override
  String toString() => jsonEncode(toMap());
}
