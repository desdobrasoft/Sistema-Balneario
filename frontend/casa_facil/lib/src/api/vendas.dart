import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/api/utils/is_ok.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/status_pagamento.dart';
import 'package:casa_facil/src/models/status_venda.dart';
import 'package:casa_facil/src/models/venda.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/parser.dart';
import 'package:casa_facil/src/services/preferences/preferences.dart';
import 'package:casa_facil/src/utils/build_url.dart';

class VendasApi {
  const VendasApi._();

  static final _env = EnvManager.env;
  static final _url =
      _env.vendas; // Confirme se 'vendas' existe no seu EnvManager

  /// Cria um novo registro de venda.
  /// Retorna o [VendaModel] criado em caso de sucesso, ou nulo em caso de falha.
  static Future<VendaModel?> addVenda({
    required int clienteId,
    required int modeloId,
    required DateTime dataVenda,
    required double preco,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.post,
      url: buildUrl(_url),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'clienteId': clienteId,
        'modeloId': modeloId,
        'data_venda': dataVenda.toIso8601String(),
        'preco': preco,
      }),
    );

    if (!isOk(res)) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: res.body),
        ignoreOpenDialog: true,
      );
      return null;
    }

    try {
      return VendaModel.fromJson(jsonDecode(res.body));
    } catch (_) {
      return null;
    }
  }

  /// Lista todas as vendas registradas.
  static Future<List<VendaModel>> listAll() async {
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
      return (json as List).map((v) => VendaModel.fromJson(v)).toList();
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: '$e'),
        ignoreOpenDialog: true,
      );
      return [];
    }
  }

  /// Atualiza o status de uma venda (produção ou pagamento).
  static Future<bool> updateVenda({
    required int vendaId,
    StatusVenda? novoStatus,
    StatusPagamento? novoStatusPagamento,
  }) async {
    final res = await HttpParser.parse(
      method: HttpMethod.patch,
      url: buildUrl('$_url/$vendaId'),
      headers: {
        'Authorization': 'Bearer ${Preferences.instance.authToken}',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        // Envia apenas os campos que não são nulos
        if (novoStatus != null) 'status': novoStatus.description,
        if (novoStatusPagamento != null)
          'status_pagamento': novoStatusPagamento.description,
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
}
