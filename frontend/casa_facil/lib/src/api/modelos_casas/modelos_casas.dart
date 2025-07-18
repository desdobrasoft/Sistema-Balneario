import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/api/modelos_casas/dto.dart';
import 'package:casa_facil/src/api/utils/is_ok.dart';
import 'package:casa_facil/src/components/dialogs/boolean.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/modelo_casa.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';

class ModelosCasasApi {
  const ModelosCasasApi._();

  static final _env = EnvManager.env;
  static final _url = _env.modeloCasa;

  static Future<void> addModeloCasa(CreateModeloCasaDto dto) async {
    final res = await HttpParser.parse(
      method: HttpMethod.post,
      url: buildUrl(_url),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: dto.toString(),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
    }
  }

  static Future<bool> editModeloCasa(EditModeloCasaDto dto) async {
    final res = await HttpParser.parse(
      method: HttpMethod.patch,
      url: buildUrl('$_url/${dto.id}'),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(dto.toMap()),
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

  static Future<List<ModeloCasaModel>> listAll() async {
    final res = await HttpParser.parse(
      url: buildUrl(_url),
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
      return (json as List).map((m) => ModeloCasaModel.fromJson(m)).toList();
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: '$e'),
        ignoreOpenDialog: true,
      );
      return [];
    }
  }

  static Future<bool> removeModeloCasa(ModeloCasaModel modelo) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Modelo',
            content:
                'Tem certeza que deseja remover o modelo "${modelo.nome}"?\nEsta ação não pode ser desfeita.',
          ),
        ) ==
        true;

    if (!accept) return false;

    final res = await HttpParser.parse(
      method: HttpMethod.delete,
      url: buildUrl('$_url/${modelo.id}'),
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
