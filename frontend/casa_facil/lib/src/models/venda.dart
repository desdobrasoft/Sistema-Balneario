import 'dart:convert' show jsonEncode;

import 'package:casa_facil/src/models/cliente.dart';
import 'package:casa_facil/src/models/historico_status.dart';
import 'package:casa_facil/src/models/modelo_casa.dart';
import 'package:casa_facil/src/models/status_pagamento.dart';
import 'package:casa_facil/src/models/status_venda.dart';
import 'package:casa_facil/src/models/user.dart';

class VendaModel {
  final int id;
  final int? clienteId;
  final int? modeloId;
  final int? userId;
  final String dataVenda;
  final double preco;
  final StatusVenda statusVenda;
  final List<HistoricoStatusModel> statusHistorico;
  final StatusPagamento statusPagamento;

  Cliente? cliente;
  ModeloCasaModel? modelo;
  UserModel? user;

  VendaModel({
    required this.id,
    this.clienteId,
    this.modeloId,
    this.userId,
    required this.dataVenda,
    required this.preco,
    required this.statusVenda,
    required this.statusHistorico,
    required this.statusPagamento,
  });

  factory VendaModel.fromJson(Map? json) {
    Object? parser;

    parser = json?[_Keys.historicoStatus];
    final statusHistorico = parser is List
        ? parser.map((s) => HistoricoStatusModel.fromJson(s)).toList()
        : List<HistoricoStatusModel>.empty(growable: false);

    return VendaModel(
      id: json?[_Keys.id],
      clienteId: json?[_Keys.clienteId],
      modeloId: json?[_Keys.modeloId],
      userId: json?[_Keys.userId],
      dataVenda: json?[_Keys.dataVenda],
      preco: json?[_Keys.preco],
      statusVenda: StatusVenda.from(json?[_Keys.status]),
      statusHistorico: statusHistorico,
      statusPagamento: StatusPagamento.from(json?[_Keys.statusPagamento]),
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.cliente: cliente?.toMap(),
    _Keys.modelo: modelo?.toMap(),
    _Keys.user: user?.toMap(),
    _Keys.dataVenda: dataVenda,
    _Keys.preco: preco,
    _Keys.status: statusVenda.description,
    _Keys.historicoStatus: statusHistorico.map((s) => s.toMap()).toList(),
    _Keys.statusPagamento: statusPagamento.description,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const clienteId = 'cliente_id';
  static const modeloId = 'modelo_id';
  static const userId = 'user_id';
  static const dataVenda = 'data_venda';
  static const preco = 'preco';
  static const status = 'status';
  static const historicoStatus = 'historico_status';
  static const statusPagamento = 'status_pagamento';

  static const cliente = 'cliente';
  static const modelo = 'modelo';
  static const user = 'user';
}
