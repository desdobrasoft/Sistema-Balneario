import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/auth.dart';
import 'package:tech_wall/src/api/users/dto.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/user.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class UsersApi {
  const UsersApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.users;

  /// Adiciona um novo usuário.
  static Future<bool> addUser(CreateUserDto dto) async {
    try {
      await _http.dio.post(buildUrl(_url), data: dto.toMap());
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return false;
    }
  }

  /// Edita o usuário atualmente logado.
  static Future<bool> editCurrent(UpdateUserDto dto) async {
    try {
      await _http.dio.patch(buildUrl(_env.currentUser), data: dto.toMap());
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return false;
    }
  }

  /// Edita um usuário específico pelo ID.
  static Future<bool> editUser({
    required int id,
    required UpdateUserDto dto,
  }) async {
    try {
      await _http.dio.patch(buildUrl('$_url/$id'), data: dto.toMap());
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return false;
    }
  }

  /// Busca os dados do usuário atualmente logado.
  static Future<UserModel?> getCurrent() async {
    try {
      final response = await _http.dio.get(buildUrl(_env.currentUser));
      return UserModel.fromJson(response.data);
    } catch (_) {
      // Falha silenciosa é aceitável aqui, pode ser token expirado.
      return null;
    }
  }

  /// Lista todos os usuários.
  static Future<List<UserModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      final json = response.data;
      return (json as List).map((user) => UserModel.fromJson(user)).toList();
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return [];
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return [];
    }
  }

  /// Remove um usuário (soft delete no backend).
  static Future<bool> removeUser(UserModel user) async {
    final current = await getCurrent();
    final isCurrent = user.id == current?.id;

    if (isCurrent) {
      final accept =
          await DialogService.instance.showDialog(
            const BooleanDialog(
              title: 'Remover Próprio Usuário',
              content: 'Após a remoção você será desconectado.\nContinuar?',
            ),
          ) ==
          true;
      if (!accept) return false;
    }

    try {
      await _http.dio.delete(buildUrl('$_url/${user.id}'));
      if (isCurrent) {
        // Força o logout local após o sucesso da remoção no backend
        await AuthApi.api.logout(forceLocal: true);
      }
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return false;
    }
  }
}
