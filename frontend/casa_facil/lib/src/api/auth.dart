import 'dart:convert' show jsonEncode, jsonDecode;

import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/show_snackbar.dart';

class AuthApi {
  // private:
  AuthApi._() {
    _isAuthenticated = _prefs.authToken != null;
  }

  final _env = EnvManager.env;
  final _prefs = Preferences.instance;

  bool _isAuthenticated = false;

  // public:
  static final AuthApi api = AuthApi._();

  bool get isAuthenticated => _isAuthenticated;

  Future<void> login({required String user, required String password}) async {
    if (user.isEmpty || password.isEmpty) {
      return;
    }

    final res = await HttpParser.parse(
      url: 'http://${_env.backendHost}:${_env.backendPort}${_env.login}',
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({"login": user, "senha": password}),
    );

    String error = '';

    try {
      final json = jsonDecode(res.body);
      if (json['success'] == true) {
        await Preferences.instance.save(authToken: json['access_token']);
        _isAuthenticated = true;
        return;
      } else {
        error = json['message'];
      }
    } catch (e) {
      error = e.toString();
    }
    if (error.length > 50) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: error),
      );
      return;
    }
    showSnackbar(error);
  }

  Future<void> logout() async {
    await Future.delayed(Duration(seconds: 1), () {
      _isAuthenticated = false;
    });
  }
}
