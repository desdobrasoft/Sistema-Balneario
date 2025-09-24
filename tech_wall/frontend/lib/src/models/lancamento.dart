import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/status_pagamento.dart';
import 'package:tech_wall/src/models/venda.dart';

enum TipoLancamento {
  receita('R', 'Receita'),
  despesa('D', 'Despesa');

  final String sigla;
  final String description;
  const TipoLancamento(this.sigla, this.description);

  factory TipoLancamento.fromSigla(String? sigla) {
    return TipoLancamento.values.firstWhere(
      (t) => t.sigla == sigla,
      orElse: () => TipoLancamento.receita,
    );
  }
}

class LancamentoModel {
  final int id;
  final TipoLancamento tipo;
  final StatusPagamento statusPagamento;
  final String? descricao;
  final double valorTotal;
  final double valorPendente;
  final String? dataVencimento;
  final String? dataUltimoPagamento;
  final VendaModel? venda;

  const LancamentoModel({
    required this.id,
    required this.tipo,
    required this.statusPagamento,
    this.descricao,
    required this.valorTotal,
    required this.valorPendente,
    this.dataVencimento,
    this.dataUltimoPagamento,
    this.venda,
  });

  factory LancamentoModel.fromJson(Map<dynamic, dynamic>? json) {
    final data = json ?? {};

    final id = data[_Keys.id] ?? 0;
    final tipo = TipoLancamento.fromSigla(data[_Keys.tipo]);
    final statusPagamento = StatusPagamento.from(
      data[_Keys.statusPagamento] ?? '',
    );
    final venda = data[_Keys.venda] != null
        ? VendaModel.fromJson(data[_Keys.venda])
        : null;

    return LancamentoModel(
      id: id,
      tipo: tipo,
      statusPagamento: statusPagamento,
      descricao: data[_Keys.descricao],
      valorTotal: double.tryParse(data[_Keys.valorTotal].toString()) ?? 0.0,
      valorPendente:
          double.tryParse(data[_Keys.valorPendente].toString()) ?? 0.0,
      dataVencimento: data[_Keys.dataVencimento],
      dataUltimoPagamento: data[_Keys.dataUltimoPagamento],
      venda: venda,
    );
  }

  Map<String, dynamic> toMap() => {
    _Keys.id: id,
    _Keys.tipo: tipo.description,
    _Keys.statusPagamento: statusPagamento.description,
    _Keys.descricao: descricao,
    _Keys.valorTotal: valorTotal,
    _Keys.valorPendente: valorPendente,
    _Keys.dataVencimento: dataVencimento,
    _Keys.dataUltimoPagamento: dataUltimoPagamento,
    _Keys.venda: venda?.toMap(),
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();
  static const id = 'id';
  static const tipo = 'tipo';
  static const statusPagamento = 'status_pagamento';
  static const descricao = 'descricao';
  static const valorTotal = 'valor_total';
  static const valorPendente = 'valor_pendente';
  static const dataVencimento = 'data_vencimento';
  static const dataUltimoPagamento = 'data_ultimo_pagamento';
  static const venda = 'vendas';
}
