import 'dart:convert' show jsonDecode;

import 'package:sistema_balneario/src/api/utils/is_ok.dart';
import 'package:sistema_balneario/src/models/user.dart';
import 'package:sistema_balneario/src/services/env/env.dart';
import 'package:sistema_balneario/src/services/http/parser.dart';
import 'package:sistema_balneario/src/services/preferences/preferences.dart';
import 'package:sistema_balneario/src/utils/build_url.dart';

class UsersApi {
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
