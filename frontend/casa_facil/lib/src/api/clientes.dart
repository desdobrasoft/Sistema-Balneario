import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/api/utils/is_ok.dart';
import 'package:casa_facil/src/components/dialogs/boolean.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/cliente.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';

class ClientesApi {
  const ClientesApi._();

  static final _env = EnvManager.env;

  static Future<void> addCliente({
    required String nome,
    String? email,
    String? nroContato,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.post,
      url: buildUrl(_env.clientes), // Assumindo que você tenha '_env.clientes'
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'nome': nome,
        if (email?.isNotEmpty == true) 'email': email,
        if (nroContato?.isNotEmpty == true) 'nro_contato': nroContato,
      }),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
    }
  }

  static Future<bool> editCliente({
    required int id,
    String? nome,
    String? email,
    String? nroContato,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.patch,
      url: buildUrl('${_env.clientes}/$id'),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        if (nome?.isNotEmpty == true) 'nome': nome,
        if (email?.isNotEmpty == true) 'email': email,
        if (nroContato?.isNotEmpty == true) 'nro_contato': nroContato,
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

  static Future<List<Cliente>> listAll() async {
    final res = await HttpParser.parse(
      url: buildUrl(_env.clientes),
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

      return (json as List).map((c) => Cliente.fromJson(c)).toList();
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: '$e'),
        ignoreOpenDialog: true,
      );
      return [];
    }
  }

  static Future<bool> removeCliente(Cliente cliente) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Cliente',
            content:
                'Tem certeza que deseja remover o cliente "${cliente.nome}"?',
          ),
        ) ==
        true;

    if (!accept) return false;

    final res = await HttpParser.parse(
      method: HttpMethod.delete,
      url: buildUrl('${_env.clientes}/${cliente.id}'),
      headers: {'Authorization': 'Bearer ${Preferences.instance.authToken}'},
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
}
