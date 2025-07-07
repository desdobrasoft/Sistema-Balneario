import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/api/auth.dart';
import 'package:casa_facil/src/api/utils/is_ok.dart';
import 'package:casa_facil/src/components/dialogs/boolean.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/user.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';

class UsersApi {
  const UsersApi._();

  static final _env = EnvManager.env;

  static Future<void> addUser({
    String? username,
    String? email,
    required String password,
    String? fullName,
    List<String>? roles,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.post,
      url: buildUrl(_env.users),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        if (fullName?.isNotEmpty == true) "full_name": fullName,
        if (username?.isNotEmpty == true) "username": username,
        if (email?.isNotEmpty == true) "email": email,
        "password": password,
        if (roles?.isNotEmpty == true) "roles": roles,
      }),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
    }
  }

  static Future<bool> editCurrent({
    String? fullName,
    String? username,
    String? email,
    String? password,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.patch,
      url: buildUrl(_env.currentUser),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        if (fullName?.isNotEmpty == true) 'full_name': fullName,
        if (username?.isNotEmpty == true) 'username': username,
        if (email?.isNotEmpty == true) 'email': email,
        if (password?.isNotEmpty == true) 'password': password,
      }),
    );

    if (!isOk(res)) {
      try {
        final json = jsonDecode(res.body) as Map;
        final details = json.containsKey('error')
            ? (json['error'] as String)
            : res.body;

        DialogService.instance.showDialog(
          ErrorDialog(
            message: json.containsKey('message')
                ? json['message']
                : defaultErrorMessage,
            detalhes:
                'Status code: ${res.statusCode}'
                '${details.isNotEmpty ? '\n$details' : ''}',
          ),
          ignoreOpenDialog: true,
        );
      } catch (e) {
        DialogService.instance.showDialog(
          ErrorDialog(message: defaultErrorMessage, detalhes: '$e'),
          ignoreOpenDialog: true,
        );
      }

      return false;
    }

    return true;
  }

  static Future<bool> editUser({
    required int id,
    String? fullName,
    String? username,
    String? email,
    String? password,
    List<String>? roles,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.patch,
      url: buildUrl('${_env.users}/$id'),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        if (fullName?.isNotEmpty == true) 'full_name': fullName,
        if (username?.isNotEmpty == true) 'username': username,
        if (email?.isNotEmpty == true) 'email': email,
        if (password?.isNotEmpty == true) 'password': password,
        if (roles?.isNotEmpty == true) 'roles': roles,
      }),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
      return false;
    }

    return true;
  }

  static Future<UserModel?> getCurrent() async {
    final res = await HttpParser.parse(
      url: buildUrl(_env.currentUser),
      headers: {'Authorization': 'Bearer ${Preferences.instance.authToken}'},
    );

    if (isOk(res)) {
      try {
        final json = jsonDecode(res.body);

        return json is Map ? UserModel.fromJson(json) : null;
      } catch (_) {
        return null;
      }
    }

    return null;
  }

  static Future<List<UserModel>> listAll() async {
    final res = await HttpParser.parse(
      url: buildUrl(_env.users),
      headers: {'Authorization': 'Bearer ${Preferences.instance.authToken}'},
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
      return [];
    }

    try {
      final json = jsonDecode(res.body);

      return (json as List).map((user) => UserModel.fromJson(user)).toList();
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: '$e'),
        ignoreOpenDialog: true,
      );
      return [];
    }
  }

  static Future<bool> removeUser(UserModel user) async {
    final current = await getCurrent();

    final isCurrent = user == current;

    if (isCurrent) {
      final accept =
          await DialogService.instance.showDialog(
            BooleanDialog(
              title: 'Remover',
              content:
                  'Você está tentando remover seu próprio usuário.\n'
                  'Após a remoção você será redirecionado para o Login e deverá acessar com um usuário diferente.\n'
                  'Continuar?',
            ),
          ) ==
          true;

      if (!accept) return true;
    }

    final res = await HttpParser.parse(
      method: HttpMethod.delete,
      url: buildUrl('${_env.users}/${user.id}'),
      headers: {'Authorization': 'Bearer ${Preferences.instance.authToken}'},
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
      return false;
    }

    if (isCurrent) {
      AuthApi.api.logout();
    }

    return true;
  }
}
