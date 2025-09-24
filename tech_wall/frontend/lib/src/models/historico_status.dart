import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_venda.dart';

class HistoricoStatusModel {
  final int id;
  final int vendaId;
  final StatusVenda? statusAnterior;
  final StatusVenda statusNovo;
  final String dataAlteracao;

  const HistoricoStatusModel({
    required this.id,
    required this.vendaId,
    this.statusAnterior,
    required this.statusNovo,
    required this.dataAlteracao,
  });

  factory HistoricoStatusModel.fromJson(Map? json) {
    Object? parser;

    parser = json?[_Keys.statusAnterior];
    final statusAnterior = parser is String ? StatusVenda.from(parser) : null;

    return HistoricoStatusModel(
      id: json?[_Keys.id],
      vendaId: json?[_Keys.vendaId],
      statusAnterior: statusAnterior,
      statusNovo: StatusVenda.from(json?[_Keys.statusNovo]),
      dataAlteracao: json?[_Keys.dataAlteracao],
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.vendaId: vendaId,
    _Keys.statusAnterior: statusAnterior?.description,
    _Keys.statusNovo: statusNovo.description,
    _Keys.dataAlteracao: dataAlteracao,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const vendaId = 'venda_id';
  static const statusAnterior = 'status_anterior';
  static const statusNovo = 'status_novo';
  static const dataAlteracao = 'data_alteracao';
}
