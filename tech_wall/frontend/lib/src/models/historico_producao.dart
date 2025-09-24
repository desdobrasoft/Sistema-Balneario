import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_producao.dart';

class HistoricoProducao {
  final int id;
  final int ordemProducaoId;
  final StatusProducao? statusAnterior;
  final StatusProducao statusNovo;
  final String? notas;
  final String? dataAlteracao;

  const HistoricoProducao({
    required this.id,
    required this.ordemProducaoId,
    this.statusAnterior,
    required this.statusNovo,
    this.notas,
    this.dataAlteracao,
  });

  factory HistoricoProducao.fromJson(Map? json) {
    Object? parser;

    parser = json?[_Keys.statusAnterior];
    final statusAnterior = parser is String
        ? StatusProducao.from(parser)
        : null;

    return HistoricoProducao(
      id: json?[_Keys.id],
      ordemProducaoId: json?[_Keys.ordemProducaoId],
      statusAnterior: statusAnterior,
      statusNovo: StatusProducao.from(json?[_Keys.statusNovo]),
      notas: json?[_Keys.notas],
      dataAlteracao: json?[_Keys.dataAlteracao],
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.ordemProducaoId: ordemProducaoId,
    _Keys.statusAnterior: statusAnterior?.description,
    _Keys.statusNovo: statusNovo.description,
    _Keys.notas: notas,
    _Keys.dataAlteracao: dataAlteracao,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const ordemProducaoId = 'ordem_producao_id';
  static const statusAnterior = 'status_anterior';
  static const statusNovo = 'status_novo';
  static const notas = 'notas';
  static const dataAlteracao = 'data_alteracao';
}
