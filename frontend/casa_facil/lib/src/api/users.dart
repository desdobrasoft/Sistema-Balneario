import 'dart:convert' show jsonDecode;

import 'package:casa_facil/src/api/utils/is_ok.dart';
import 'package:casa_facil/src/models/user.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';

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
