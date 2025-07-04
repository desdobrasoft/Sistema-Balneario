import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/api/utils/is_ok.dart';
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

  static Future<void> addUser({
    String? username,
    String? email,
    required String password,
    String? fullName,
    List<String>? roles,
  }) async {
    final res = await HttpParser.parse(
      url: buildUrl(EnvManager.env.users),
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

    print(res.body);

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
      );
    }
  }

  static Future<List<UserModel>> listAll() async {
    final res = await HttpParser.parse(
      url: buildUrl(EnvManager.env.users),
      headers: {'Authorization': 'Bearer ${Preferences.instance.authToken}'},
    );

    if (isOk(res)) {
      final json = jsonDecode(res.body);

      return json is List
          ? json.map((user) => UserModel.fromJson(user)).toList()
          : [];
    }

    // TODO: Tratar melhor as exceções aqui.
    return [];
  }
}
