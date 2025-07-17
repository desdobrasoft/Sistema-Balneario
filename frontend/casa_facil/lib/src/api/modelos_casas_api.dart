import 'dart:convert' show jsonDecode, jsonEncode;

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

  static Future<void> addModeloCasa({
    required String nome,
    String? descricao,
    required int tempoFabricacao,
    String? urlImagem,
    required double preco,
    required List<Map<String, dynamic>> materiais,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.post,
      url: buildUrl(_url),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'nome': nome,
        'descricao': descricao,
        'tempo_fabricacao': tempoFabricacao,
        'url_imagem': urlImagem,
        'preco': preco,
        'materiais': materiais,
      }),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
    }
  }

  static Future<bool> editModeloCasa({
    required int id,
    String? nome,
    String? descricao,
    int? tempoFabricacao,
    String? urlImagem,
    double? preco,
    List<Map<String, dynamic>>? materiais,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.patch,
      url: buildUrl('$_url/$id'),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        if (nome != null) 'nome': nome,
        if (descricao != null) 'descricao': descricao,
        if (tempoFabricacao != null) 'tempo_fabricacao': tempoFabricacao,
        if (urlImagem != null) 'url_imagem': urlImagem,
        if (preco != null) 'preco': preco,
        if (materiais != null) 'materiais': materiais,
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
