import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/historico_producao.dart';
import 'package:tech_wall/src/models/status_producao.dart';
import 'package:tech_wall/src/models/venda.dart';

class OrdemProducaoModel {
  final int id;
  final String? dataAgendamento;
  final List<HistoricoProducao> historicoProducao;
  final StatusProducao status;
  final VendaModel venda;

  const OrdemProducaoModel({
    required this.id,
    this.dataAgendamento,
    required this.historicoProducao,
    required this.status,
    required this.venda,
  });

  factory OrdemProducaoModel.fromJson(Map<dynamic, dynamic>? json) {
    final data = json ?? {};
    Object? parser;

    parser = data[_Keys.historicoProducao];
    final historicoProducao = parser is List
        ? parser.map((s) => HistoricoProducao.fromJson(s)).toList()
        : List<HistoricoProducao>.empty(growable: false);

    return OrdemProducaoModel(
      id: data[_Keys.id] ?? 0,
      dataAgendamento: data[_Keys.dataAgendamento],
      historicoProducao: historicoProducao,
      status: StatusProducao.from(data[_Keys.status]),
      venda: VendaModel.fromJson(data[_Keys.venda]),
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.dataAgendamento: dataAgendamento,
    _Keys.historicoProducao: historicoProducao.map((h) => h.toMap()).toList(),
    _Keys.status: status.description,
    _Keys.venda: venda,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const dataAgendamento = 'data_agendamento';
  static const historicoProducao = 'ordens_producao_historico';
  static const status = 'status';
  static const venda = 'vendas';
}
