import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/api/utils/is_ok.dart';
import 'package:casa_facil/src/components/dialogs/boolean.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/materiais_estoque.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';

class MateriaisEstoqueApi {
  const MateriaisEstoqueApi._();

  static final _env = EnvManager.env;
  static final _url = _env.materiais;

  /// Cria um novo material no estoque.
  static Future<void> addMaterial({
    required String id,
    required String nome,
    int? qtEstoque,
    int? limBaixoEstoque,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.post,
      url: buildUrl(_url),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'id': id,
        'nome': nome,
        if (qtEstoque != null) 'qt_estoque': qtEstoque,
        if (limBaixoEstoque != null) 'lim_baixo_estoque': limBaixoEstoque,
      }),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
    }
  }

  /// Lista todos os materiais ativos no estoque.
  static Future<List<MateriaisEstoque>> listAll() async {
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
      return (json as List).map((m) => MateriaisEstoque.fromJson(m)).toList();
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: '$e'),
        ignoreOpenDialog: true,
      );
      return [];
    }
  }

  /// Busca um único material pelo seu ID.
  static Future<MateriaisEstoque?> getMaterial(String id) async {
    final res = await HttpParser.parse(
      url: buildUrl('$_url/$id'),
      headers: {'Authorization': 'Bearer ${Preferences.instance.authToken}'},
    );

    if (!isOk(res)) {
      // Não mostra um dialog de erro para um simples 404 (não encontrado)
      if (res.statusCode != 404) {
        DialogService.instance.showDialog(
          ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
          ignoreOpenDialog: true,
        );
      }
      return null;
    }

    try {
      return MateriaisEstoque.fromJson(jsonDecode(res.body));
    } catch (_) {
      return null;
    }
  }

  /// Atualiza os dados de um material existente.
  static Future<bool> editMaterial({
    required String id,
    String? nome,
    int? qtEstoque,
    int? limBaixoEstoque,
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
        if (qtEstoque != null) 'qt_estoque': qtEstoque,
        if (limBaixoEstoque != null) 'lim_baixo_estoque': limBaixoEstoque,
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

  /// Remove um material do estoque (soft delete).
  static Future<bool> removeMaterial(MateriaisEstoque material) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Material',
            content:
                'Tem certeza que deseja remover o material "${material.nome}"?',
          ),
        ) ==
        true;

    if (!accept) return false;

    final res = await HttpParser.parse(
      method: HttpMethod.delete,
      url: buildUrl('$_url/${material.id}'),
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
