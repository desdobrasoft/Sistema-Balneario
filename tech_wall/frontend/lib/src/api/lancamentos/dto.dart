import 'dart:convert' show jsonEncode;

import 'package:tech_wall/src/models/lancamento.dart';
import 'package:tech_wall/src/models/status_pagamento.dart';

class CreateLancamentoDto {
  final TipoLancamento tipo;
  final String descricao;
  final double valorTotal;
  final DateTime? dataVencimento;
  final int? vendaId;
  final int? movimentacaoMaterialId;

  const CreateLancamentoDto({
    required this.tipo,
    required this.descricao,
    required this.valorTotal,
    this.dataVencimento,
    this.vendaId,
    this.movimentacaoMaterialId,
  });

  Map<String, dynamic> toMap() => {
    'tipo': tipo.sigla,
    'descricao': descricao,
    'valor_total': valorTotal,
    if (dataVencimento != null)
      'data_vencimento': dataVencimento!.toIso8601String(),
    if (vendaId != null) 'vendaId': vendaId,
    if (movimentacaoMaterialId != null)
      'movimentacaoMaterialId': movimentacaoMaterialId,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class UpdateLancamentoDto {
  final String? descricao;
  final StatusPagamento? statusPagamento;
  final double? valorPago;
  final DateTime? dataVencimento;

  const UpdateLancamentoDto({
    this.descricao,
    this.statusPagamento,
    this.valorPago,
    this.dataVencimento,
  });

  Map<String, dynamic> toMap() => {
    if (descricao != null) 'descricao': descricao,
    if (statusPagamento != null) 'status_pagamento': statusPagamento!.prisma,
    if (valorPago != null) 'valor_pago': valorPago,
    if (dataVencimento != null)
      'data_vencimento': dataVencimento!.toIso8601String(),
  };

  @override
  String toString() => jsonEncode(toMap());
}
