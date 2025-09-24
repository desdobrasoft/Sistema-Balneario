import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import 'package:tech_wall/src/api/auth.dart';
import 'package:tech_wall/src/app.dart';
import 'package:tech_wall/src/routes/routes.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/preferences/preferences.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class HttpService {
  HttpService._() {
    _dio = Dio(BaseOptions(baseUrl: buildUrl()));

    _dio.interceptors.add(
      QueuedInterceptorsWrapper(
        // Adiciona o token de acesso em cada requisição
        onRequest: (options, handler) {
          if (_prefs.authToken != null) {
            options.headers['Authorization'] = 'Bearer ${_prefs.authToken}';
          }
          return handler.next(options);
        },
        // Lida com erros (ex: token expirado)
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401 &&
              _prefs.refreshToken != null) {
            try {
              // Tenta renovar o token
              final newAccessToken = await _getNewAccessToken();

              // Salva o novo token
              await _prefs.save(authToken: newAccessToken);

              // Refaz a requisição original com o novo token
              error.requestOptions.headers['Authorization'] =
                  'Bearer $newAccessToken';
              final response = await _dio.fetch(error.requestOptions);
              return handler.resolve(response);
            } catch (e) {
              // Se a renovação falhar, faz o logout
              await AuthApi.api.logout(forceLocal: true);

              final context = TechWall.appKey.currentContext;
              if (context != null && context.mounted) {
                context.go(Routes.sessaoExpirada.path);
              }

              return handler.reject(error);
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  late final Dio _dio;

  final _env = EnvManager.env;
  final _prefs = Preferences.instance;

  Future<String> _getNewAccessToken() async {
    final response = await Dio().post(
      buildUrl(_env.refresh),
      options: Options(
        headers: {'Authorization': 'Bearer ${_prefs.refreshToken}'},
      ),
    );
    return response.data['access_token'];
  }

  static final instance = HttpService._();

  Dio get dio => _dio;
}
