import 'dart:convert' show jsonEncode;

import 'package:flutter_dotenv/flutter_dotenv.dart' show dotenv;

class _Keys {
  const _Keys._();

  static const adminUser = 'ADMIN_USER';
  static const adminPwrd = 'ADMIN_PWRD';
}

class EnvManager {
  EnvManager._();

  late String? _adminUser;
  late String? _adminPwrd;

  static final env = EnvManager._();

  String? get adminUser => _adminUser;
  String? get adminPwrd => _adminPwrd;

  Future<void> init() async {
    await dotenv.load(fileName: '.env');

    _adminUser = dotenv.maybeGet(_Keys.adminUser);
    _adminPwrd = dotenv.maybeGet(_Keys.adminPwrd);
  }

  Map<String, Object?> get json => {
    _Keys.adminUser: adminUser,
    _Keys.adminPwrd: adminPwrd,
  };

  @override
  String toString() => jsonEncode(json);
}
