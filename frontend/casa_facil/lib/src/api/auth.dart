import 'package:casa_facil/src/api/users/users.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/user.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/service.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';
import 'package:casa_facil/src/utils/show_snackbar.dart';
import 'package:dio/dio.dart' show DioException;
import 'package:flutter/foundation.dart';

class AuthApi with ChangeNotifier {
  // private:
  AuthApi._() {
    _isAuthenticated = _prefs.authToken != null;
    if (_isAuthenticated) {
      Future.microtask(() async {
        _user = await UsersApi.getCurrent();
        notifyListeners();
      });
    }
  }

  final _env = EnvManager.env;
  final _http = HttpService.instance;
  final _prefs = Preferences.instance;

  bool _isAuthenticated = false;
  UserModel? _user;

  // public:
  static final AuthApi api = AuthApi._();

  bool get isAuthenticated => _isAuthenticated;
  UserModel? get user => _user;

  Future<void> login({required String user, required String password}) async {
    if (user.isEmpty || password.isEmpty) return;

    try {
      final res = await _http.dio.post(
        _env.login,
        data: {"login": user, "senha": password},
      );

      final data = res.data;

      await _prefs.save(
        authToken: data['access_token'],
        refreshToken: data['refresh_token'],
      );

      _isAuthenticated = true;
      _user = await UsersApi.getCurrent();
      notifyListeners();
    } on DioException catch (e) {
      final code = e.response?.statusCode;
      final reason = e.response?.statusMessage;
      String message =
          '$defaultErrorMessage'
          '${code != null || reason?.isNotEmpty == true ? ' - ' : ''}'
          '${code != null ? '$code' : ''}'
          '${code != null && reason?.isNotEmpty == true ? ': ' : ''}'
          '${reason?.isNotEmpty == true ? '$reason' : ''}';

      if (e.response?.data is Map<String, dynamic>) {
        final responseData = e.response!.data as Map<String, dynamic>;

        // 2. Verifica se a chave 'message' existe nos dados
        if (responseData.containsKey('message')) {
          final messageValue = responseData['message'];

          // 3. Trata o valor de 'message' (pode ser uma lista ou uma string)
          if (messageValue is List) {
            message = messageValue.join('\n'); // Junta com quebra de linha
          } else {
            message = messageValue.toString();
          }
        }
      }

      showSnackbar(message);
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
        ignoreOpenDialog: true,
      );
    }
  }

  /// Faz o logout.
  /// [forceLocal] é usado pelo interceptor para evitar um loop infinito em caso de falha no refresh.
  Future<void> logout({bool forceLocal = false}) async {
    if (!forceLocal && _prefs.authToken != null) {
      try {
        // Tenta fazer o logout no backend para invalidar o refresh token
        await _http.dio.post(buildUrl(_env.logout));
      } catch (_) {
        // Ignora erros no logout do backend, o logout local é mais importante
      }
    }

    // Limpa o estado local e os tokens, independentemente do sucesso da chamada da API
    _isAuthenticated = false;
    _user = null;
    await _prefs.clear();
    notifyListeners();
  }
}
