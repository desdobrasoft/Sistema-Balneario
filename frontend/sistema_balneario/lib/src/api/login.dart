import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:sistema_balneario/src/services/env/env.dart';

class AuthApi {
  // private:
  AuthApi._();

  final _env = EnvManager.env;

  bool _isAuthenticated = kDebugMode;

  // public:
  static final AuthApi api = AuthApi._();

  bool get isAuthenticated => _isAuthenticated;

  Future<void> login({required String user, required String password}) async {
    if (user.isEmpty || password.isEmpty) {
      return;
    }

    await Future.delayed(Duration(seconds: 2), () {
      if (user == _env.adminUser && password == _env.adminPwrd) {
        _isAuthenticated = true;
      }
    });
  }

  Future<void> logout() async {
    await Future.delayed(Duration(seconds: 1), () {
      _isAuthenticated = false;
    });
  }
}
