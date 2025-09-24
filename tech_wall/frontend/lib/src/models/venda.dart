import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/cliente.dart';
import 'package:tech_wall/src/models/historico_status.dart';
import 'package:tech_wall/src/models/modelo_casa.dart';
import 'package:tech_wall/src/models/status_pagamento.dart';
import 'package:tech_wall/src/models/status_venda.dart';

class VendaModel {
  final int id;
  final int? clienteId;
  final int? modeloId;
  final ClienteModel? cliente;
  final ModeloCasaModel? modelo;
  final String dataVenda;
  final double preco;
  final StatusVenda statusVenda;
  final List<HistoricoStatusModel> statusHistorico;
  final StatusPagamento statusPagamento;

  VendaModel({
    required this.id,
    this.clienteId,
    this.modeloId,
    this.cliente,
    this.modelo,
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
      cliente: json?[_Keys.cliente] != null
          ? ClienteModel.fromJson(json?[_Keys.cliente])
          : null,
      modelo: json?[_Keys.modelo] != null
          ? ModeloCasaModel.fromJson(json?[_Keys.modelo])
          : null,
      dataVenda: json?[_Keys.dataVenda],
      preco: double.parse('${json?[_Keys.preco]}'),
      statusVenda: StatusVenda.from(json?[_Keys.status]),
      statusHistorico: statusHistorico,
      statusPagamento: StatusPagamento.from(json?[_Keys.statusPagamento]),
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.cliente: cliente?.toMap(),
    _Keys.modelo: modelo?.toMap(),
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
  static const dataVenda = 'data_venda';
  static const preco = 'preco';
  static const status = 'status';
  static const historicoStatus = 'vendas_historico';
  static const statusPagamento = 'status_pagamento';
  static const cliente = 'clientes';
  static const modelo = 'modelo_casa';
}
